import axios from 'axios';
import { action, computed, makeObservable, observable, reaction, runInAction } from 'mobx';

import type { IBaseUserPort } from '@/entities/user';
import { LS_PREFIX } from '@/shared/config';
import { storage } from '@/shared/lib/storage';
import { BaseStore } from '@/shared/lib/store';
import { generateUUID } from '@/shared/lib/utils';

import { ASSISTANT_MAX_LENGTH, ASSISTANT_MODES } from './constants';
import type { IAssistantRepo } from './ports';
import type {
	ArchivedConversation,
	AssistantGeneration,
	AssistantLimits,
	AssistantMessage,
	AssistantMode,
	AssistantPhase,
	AssistantSnapshot,
	SendMessage,
} from './types';

type Intent =
	| { kind: 'send'; data: SendMessage; draft: string }
	| { kind: 'retry' | 'regenerate'; id: string; requestId: string; searchEnabled?: boolean };

export class AssistantStore extends BaseStore {
	private submissionError: string | null = null;
	private owner: string | null = null;
	private attached = false;
	private controller: AbortController | null = null;
	private timer: ReturnType<typeof setTimeout> | null = null;
	private limitsController: AbortController | null = null;
	private limitsTimer: ReturnType<typeof setTimeout> | null = null;
	private archiveController: AbortController | null = null;
	private searchTimer: ReturnType<typeof setTimeout> | null = null;
	private refreshActive = false;
	private pendingStopId: string | null = null;
	private resumeRequest: { id: string; expectedActiveId: string | null } | null = null;

	searchEnabled = false;

	limits: AssistantLimits | null = null;
	limitsOpen = false;
	limitsLoading = false;
	limitsError: string | null = null;

	view: 'active' | 'archive' | 'readonly' = 'active';

	archiveItems: ArchivedConversation[] = [];
	search = '';
	archivePage = 0;
	archiveHasMore = false;
	archiveLoading = false;
	archiveSaving = false;
	archiveError: string | null = null;
	archivedConversation: ArchivedConversation | null = null;
	archivedMessages: AssistantMessage[] = [];
	archivedBefore: number | null = null;

	input = '';
	lastSubmittedMessageId: string | null = null;
	mode: AssistantMode = 'ask';
	conversation: AssistantSnapshot['conversation'] = null;
	messages: AssistantMessage[] = [];
	generation: AssistantGeneration | null = null;
	generations: Record<string, AssistantGeneration> = {};

	error: string | null = null;
	historyError: string | null = null;
	loaded = false;
	loading = false;
	loadingHistory = false;
	saving = false;
	stopping = false;

	before: number | null = null;
	intent: Intent | null = null;

	get generating(): boolean {
		return this.generation?.execution_pending === true;
	}

	get busy(): boolean {
		return this.controller !== null;
	}

	get isSyncing(): boolean {
		return (
			this.loaded &&
			(this.phase === 'loading' ||
				this.phase === 'generating' ||
				this.phase === 'stopping' ||
				this.busy ||
				this.archiveSaving)
		);
	}

	get phase(): AssistantPhase {
		if (this.loading && !this.loaded) return 'loading';
		if (this.stopping || (this.generation?.status === 'cancelled' && this.generating)) return 'stopping';
		if (this.generating || this.saving) return 'generating';

		return this.error ? 'error' : 'idle';
	}

	get visibleMessages(): AssistantMessage[] {
		return this.messages.map((m) => ({
			...m,
			generation: m.role === 'assistant' ? (m.answer_generation ?? undefined) : this.generations[m.id],
		}));
	}

	get canSend(): boolean {
		return (
			this.view === 'active' &&
			this.loaded &&
			!this.busy &&
			!this.generating &&
			!this.intent &&
			!this.archiveSaving
		);
	}

	get canResumeConversation(): boolean {
		return (
			this.view === 'readonly' &&
			!!this.archivedConversation &&
			this.loaded &&
			!this.busy &&
			!this.generating &&
			!this.intent &&
			!this.archiveLoading &&
			!this.archiveSaving
		);
	}

	get submissionRecovery(): { error: string; messageId: string | null; disabled: boolean } | null {
		if (!this.intent || !this.submissionError) return null;

		const intent = this.intent;

		const generation =
			intent.kind === 'send' ? undefined : Object.values(this.generations).find((item) => item.id === intent.id);

		const messageId =
			generation && this.messages.some((item) => item.id === generation.user_message_id && item.role === 'user')
				? generation.user_message_id
				: null;

		return {
			error: this.submissionError,
			messageId,
			disabled: this.busy || this.generating || !this.available() || this.view !== 'active',
		};
	}

	get regenerateMessageId(): string | null {
		const answer = [...this.messages]
			.reverse()
			.find((message) => message.role === 'assistant' && message.reply_to_message_id);
		return answer?.reply_to_message_id && this.generations[answer.reply_to_message_id] ? answer.id : null;
	}

	setSearchEnabled(enabled: boolean): void {
		this.searchEnabled = enabled;
	}

	setLimitsOpen = (open: boolean): void => {
		this.limitsOpen = open && this.available();

		if (this.limitsTimer) clearTimeout(this.limitsTimer);
		this.limitsTimer = null;

		if (this.limitsOpen) void this.loadLimits();
		else {
			this.limitsController?.abort();
			this.limitsController = null;
			this.limitsLoading = false;
		}
	};

	async loadLimits(): Promise<void> {
		if (!this.available() || this.limitsController) return;

		if (this.limitsTimer) clearTimeout(this.limitsTimer);
		this.limitsTimer = null;

		const controller = new AbortController();

		this.limitsController = controller;
		this.limitsLoading = true;

		const owner = this.owner;

		try {
			const result = await this.repo.limits(controller.signal);

			if (this.limitsController !== controller || owner !== this.owner) return;
			runInAction(() => {
				this.limits = result;
				this.limitsError = null;
			});
		} catch (error) {
			if (this.limitsController !== controller || controller.signal.aborted || owner !== this.owner) return;

			runInAction(() => (this.limitsError = 'Не удалось загрузить лимиты'));

			if (axios.isAxiosError(error) && [401, 419].includes(error.response?.status ?? 0)) this.endSession();
		} finally {
			if (this.limitsController === controller)
				runInAction(() => {
					this.limitsController = null;
					this.limitsLoading = false;

					if (this.limitsOpen && this.available())
						this.limitsTimer = setTimeout(() => void this.loadLimits(), 25000);
				});
		}
	}

	setInput = (value: string): void => {
		this.input = value.slice(0, ASSISTANT_MAX_LENGTH);
		this.persist();
	};

	setMode = (mode: AssistantMode): void => {
		this.mode = mode;
		this.persist();
	};

	async load(): Promise<void> {
		if (!this.available() || this.busy || this.archiveSaving) return;

		this.loading = true;

		await this.perform(
			(signal) => this.repo.active(signal),
			(snapshot) => this.applyActiveSnapshot(snapshot)
		);
		runInAction(() => {
			if (!this.busy) this.loading = false;
		});
	}

	async loadOlder(): Promise<void> {
		if (!this.available() || !this.conversation || this.before === null || this.busy) return;

		this.loadingHistory = true;
		this.historyError = null;

		await this.perform(
			(signal) => this.repo.history(this.conversation!.id, this.before!, signal),
			(page) => {
				this.merge(page.messages);
				for (const g of page.generations) this.applyGeneration(g, false);
				this.before = page.pagination.before_sequence;
			},
			true
		);
		runInAction(() => {
			if (!this.busy) this.loadingHistory = false;
		});
	}

	async send(): Promise<void> {
		if (!this.available() || !this.canSend || !this.input.trim()) return;

		this.intent = {
			kind: 'send',
			data: {
				request_id: generateUUID(),
				conversation_id: this.conversation?.id ?? null,
				mode: this.mode,
				content: this.input.trim(),
				search_enabled: this.searchEnabled,
			},
			draft: this.input,
		};

		if (this.persist()) await this.repeatSubmission();
	}

	async repeatSubmission(): Promise<void> {
		if (this.view !== 'active' || !this.intent || this.busy || !this.available()) return;

		const intent = this.intent;
		this.saving = true;

		if (intent.kind === 'send') {
			await this.perform(
				(signal) => this.repo.send(intent.data, signal),
				(result) => {
					this.conversation ??= { id: result.generation.conversation_id, title: '' };
					this.merge([result.message]);
					this.lastSubmittedMessageId = result.message.id;
					this.applyGeneration(result.generation);
					if (this.input === intent.draft) this.input = '';
					this.intent = null;
					this.submissionError = null;
					this.persist();
				}
			);
		} else {
			await this.perform(
				(signal) =>
					intent.kind === 'regenerate'
						? this.repo.regenerate(intent.id, intent.requestId, signal, intent.searchEnabled ?? false)
						: this.repo.retry(intent.id, intent.requestId, signal),
				(g) => {
					this.applyGeneration(g);
					this.intent = null;
					this.submissionError = null;
					this.persist();
				}
			);
		}
		runInAction(() => {
			if (!this.busy) this.saving = false;
		});
	}

	async retry(id: string): Promise<void> {
		if (!this.available() || !this.canSend) return;

		this.intent = { kind: 'retry', id, requestId: generateUUID() };

		if (this.persist()) await this.repeatSubmission();
	}

	async regenerate(id: string): Promise<void> {
		if (!this.available() || !this.canSend) return;

		this.intent = { kind: 'regenerate', id, requestId: generateUUID(), searchEnabled: this.searchEnabled };

		if (this.persist()) await this.repeatSubmission();
	}

	async stop(): Promise<void> {
		if (!this.available() || !this.generation || !this.generating) return;
		if (!['queued', 'running'].includes(this.generation.status)) return;

		const id = this.generation.id;
		if (this.pendingStopId === id || this.stopping) return;

		this.pendingStopId = id;
		this.stopping = true;

		if (!this.busy) await this.flushPendingStop();
	}

	async newConversation(): Promise<void> {
		if (!this.available() || !this.canSend) return;

		let saved = false;
		const owner = this.owner;

		await this.perform(
			(signal) => this.repo.newConversation(signal),
			(result) => {
				saved = true;
				if (result.archived_conversation_id || !this.conversation) {
					this.searchEnabled = false;
					this.conversation = null;
					this.messages = [];
					this.generations = {};
					this.generation = null;
					this.before = null;
				}
			}
		);

		if (saved && owner === this.owner && this.available()) await this.load();
	}

	async resumeConversation(): Promise<void> {
		if (!this.available() || !this.canResumeConversation || !this.archivedConversation) return;

		const id = this.archivedConversation.id;
		if (this.resumeRequest?.id !== id) this.resumeRequest = { id, expectedActiveId: this.conversation?.id ?? null };

		const request = this.resumeRequest;
		const owner = this.owner;
		let conflict = false;
		this.halt();

		const saved = await this.archiveRequest(
			async (signal) => {
				try {
					return await this.repo.resumeConversation(request.id, request.expectedActiveId, signal);
				} catch (error) {
					conflict = axios.isAxiosError(error) && error.response?.status === 409;
					throw error;
				}
			},
			(snapshot) => {
				this.messages = [];
				this.generations = {};
				this.applyActiveSnapshot(snapshot);
				this.view = 'active';
				this.searchEnabled = false;
				this.input = '';
				this.lastSubmittedMessageId = null;
				this.error = null;
				this.historyError = null;
				this.resumeRequest = null;
				this.archivedConversation = null;
				this.archivedMessages = [];
				this.archivedBefore = null;
				this.archiveItems = [];
				this.archivePage = 0;
				this.archiveHasMore = false;
				this.persist();
			},
			true
		);
		if (!saved && conflict && owner === this.owner && this.available() && this.resumeRequest === request)
			runInAction(() => {
				this.resumeRequest = null;
				this.archiveError = 'Активный диалог изменился или генерация ещё выполняется. Обновите состояние.';
			});
	}

	openArchive = (): void => {
		if (this.archiveSaving || !this.available()) return;

		this.view = 'archive';
		void this.loadArchive();
	};

	returnActive = (): void => {
		if (this.archiveSaving) return;

		this.cancelArchiveRead();
		this.view = 'active';
		this.archiveError = null;

		if (this.busy) this.refreshActive = true;
		else void this.load();
	};

	setSearch(value: string): void {
		if (this.archiveSaving) return;

		this.search = value.slice(0, 255);
		this.archiveItems = [];
		this.archivePage = 0;
		this.archiveHasMore = false;

		this.cancelArchiveRead();

		this.archiveError = null;

		this.searchTimer = setTimeout(() => {
			runInAction(() => (this.searchTimer = null));
			if (this.view === 'archive') void this.loadArchive();
		}, 350);
	}

	async loadArchive(more = false): Promise<void> {
		if (this.archiveSaving || (more && (!this.archiveHasMore || this.archiveLoading))) return;

		this.cancelArchiveRead();

		const page = more ? this.archivePage + 1 : 1;

		await this.archiveRequest(
			(signal) => this.repo.archive(this.search, page, signal),
			(result) => {
				this.archiveItems = [
					...new Map(
						[...(more ? this.archiveItems : []), ...result.data].map((item) => [item.id, item])
					).values(),
				];
				this.archivePage = result.meta.current_page;
				this.archiveHasMore = result.meta.current_page < result.meta.last_page;
			}
		);
	}

	async openArchived(conversation: ArchivedConversation): Promise<void> {
		if (this.archiveSaving) return;

		this.cancelArchiveRead();

		this.view = 'readonly';
		this.searchEnabled = false;
		this.archivedConversation = conversation;
		this.archivedMessages = [];
		this.archivedBefore = null;

		await this.archiveRequest(
			(signal) => this.repo.archivedMessages(conversation.id, null, signal),
			(page) => this.applyArchivedPage(page)
		);
	}

	async loadArchivedOlder(): Promise<void> {
		if (!this.archivedConversation || this.archivedBefore === null || this.archiveLoading || this.archiveSaving)
			return;

		const id = this.archivedConversation.id;
		const before = this.archivedBefore;

		await this.archiveRequest(
			(signal) => this.repo.archivedMessages(id, before, signal),
			(page) => this.applyArchivedPage(page)
		);
	}

	async pinArchive(conversation: ArchivedConversation): Promise<void> {
		if (this.archiveLoading || this.archiveSaving) return;

		const owner = this.owner;
		const saved = await this.archiveRequest(
			(signal) => this.repo.pin(conversation.id, !conversation.pinned_at, signal),
			(result) => {
				this.archiveItems = this.archiveItems
					.map((item) => (item.id === result.id ? result : item))
					.sort(
						(a, b) =>
							Number(!!b.pinned_at) - Number(!!a.pinned_at) ||
							b.last_activity_at.localeCompare(a.last_activity_at) ||
							b.id.localeCompare(a.id)
					);
				if (this.archivedConversation?.id === result.id) this.archivedConversation = result;
			},
			true
		);
		if (saved && owner === this.owner && this.available()) await this.loadArchive();
	}

	async deleteArchive(id: string): Promise<void> {
		if (this.archiveSaving) return;

		const owner = this.owner;
		this.cancelArchiveRead();

		const saved = await this.archiveRequest(
			(signal) => this.repo.deleteConversation(id, signal),
			() => {
				this.archiveItems = this.archiveItems.filter((item) => item.id !== id);

				if (this.archivedConversation?.id === id) {
					this.archivedConversation = null;
					this.archivedMessages = [];
					this.archivedBefore = null;

					if (this.view === 'readonly') this.view = 'active';
				}
			},
			true
		);
		if (saved && owner === this.owner && this.available()) {
			if (this.view === 'archive') await this.loadArchive();
			if (this.view === 'active') this.returnActive();
		}
	}

	attach(): void {
		this.attached = true;
		void this.load();

		if (this.view === 'archive') void this.loadArchive();
		if (this.view === 'readonly' && this.archivedConversation) void this.openArchived(this.archivedConversation);
	}

	detach(): void {
		this.setLimitsOpen(false);
		this.attached = false;
		this.halt();
		this.loading = false;
		this.loadingHistory = false;
		this.saving = false;
		this.stopping = false;
	}

	private applyActiveSnapshot(snapshot: AssistantSnapshot): void {
		if (this.conversation?.id !== snapshot.conversation?.id) {
			this.searchEnabled = false;
			this.messages = [];
			this.generations = {};
		}

		this.conversation = snapshot.conversation;
		this.merge(snapshot.messages);
		for (const g of snapshot.generations) this.applyGeneration(g, false);
		this.generation =
			snapshot.pending_generation ??
			[...snapshot.generations].sort(
				(a, b) => b.created_at.localeCompare(a.created_at) || b.id.localeCompare(a.id)
			)[0] ??
			null;
		this.before = snapshot.pagination.before_sequence;
		this.loaded = true;
	}

	private applyArchivedPage(page: AssistantSnapshot): void {
		const generations = new Map(page.generations.map((item) => [item.user_message_id, item]));
		const messages = page.messages.map((item) => ({
			...item,
			generation: item.role === 'assistant' ? (item.answer_generation ?? undefined) : generations.get(item.id),
		}));

		this.archivedMessages = [
			...new Map([...this.archivedMessages, ...messages].map((item) => [item.id, item])).values(),
		].sort((a, b) => a.sequence - b.sequence);

		this.archivedBefore = page.pagination.before_sequence;
	}

	private async archiveRequest<T>(
		request: (signal: AbortSignal) => Promise<T>,
		apply: (data: T) => void,
		mutation = false
	): Promise<boolean> {
		if (!this.available() || this.archiveController) return false;

		const controller = new AbortController();
		this.archiveController = controller;

		const owner = this.owner;

		this.archiveLoading = !mutation;
		this.archiveSaving = mutation;
		this.archiveError = null;

		try {
			const result = await request(controller.signal);

			if (this.archiveController !== controller || this.owner !== owner) return false;

			runInAction(() => apply(result));
			return true;
		} catch (error) {
			if (this.archiveController !== controller || this.owner !== owner || controller.signal.aborted)
				return false;

			const status = axios.isAxiosError(error) ? error.response?.status : undefined;

			runInAction(() => {
				this.archiveError =
					status === 404
						? 'Диалог недоступен'
						: status === 409
							? 'Операция сейчас недоступна'
							: 'Не удалось выполнить операцию с архивом';
			});

			if (status === 401 || status === 419) this.endSession();

			return false;
		} finally {
			if (this.archiveController === controller)
				runInAction(() => {
					this.archiveController = null;
					this.archiveLoading = false;
					this.archiveSaving = false;
					this.resumeOperations();
				});
		}
	}

	private cancelArchiveRead(): void {
		if (this.searchTimer) clearTimeout(this.searchTimer);
		this.searchTimer = null;
		this.archiveController?.abort();
		this.archiveController = null;
		this.archiveLoading = false;
	}

	private async flushPendingStop(): Promise<void> {
		const id = this.pendingStopId;
		if (!id || this.busy || this.archiveSaving) return;

		if (
			!this.available() ||
			!this.generating ||
			this.generation?.id !== id ||
			!['queued', 'running'].includes(this.generation.status)
		) {
			this.pendingStopId = null;
			this.stopping = false;
			this.resumeOperations();
			return;
		}

		this.pendingStopId = null;
		this.stopping = true;

		const owner = this.owner;
		const operation = this.perform(
			(signal) => this.repo.cancel(id, signal),
			(generation) => this.applyGeneration(generation)
		);

		const controller = this.controller;

		try {
			await operation;
		} finally {
			if (this.owner === owner && controller && !controller.signal.aborted)
				runInAction(() => (this.stopping = false));
		}
	}

	private resumeOperations(): void {
		if (!this.available() || this.busy || this.archiveSaving) return;

		if (this.pendingStopId) {
			void this.flushPendingStop();
			return;
		}

		if (this.refreshActive) {
			this.refreshActive = false;
			void this.load();
		} else this.schedule();
	}

	private async poll(): Promise<void> {
		if (!this.generation?.execution_pending || this.busy) return;

		await this.perform(
			(signal) => this.repo.generation(this.generation!.id, signal),
			(g) => this.applyGeneration(g)
		);
	}

	private async perform<T>(
		request: (signal: AbortSignal) => Promise<T>,
		apply: (data: T) => void,
		history = false
	): Promise<void> {
		if (!this.available() || this.busy || this.archiveSaving) return;

		if (this.timer) clearTimeout(this.timer);
		this.timer = null;

		const controller = new AbortController();
		runInAction(() => (this.controller = controller));

		const owner = this.owner;

		try {
			const result = await request(controller.signal);

			if (this.controller !== controller || this.owner !== owner) return;

			runInAction(() => {
				this.error = null;
				apply(result);
			});
		} catch (error) {
			if (this.controller !== controller || this.owner !== owner || controller.signal.aborted) return;

			const status = axios.isAxiosError(error) ? error.response?.status : undefined;

			runInAction(() => {
				const message =
					status === 401 || status === 419
						? 'Сессия завершена'
						: status === 403
							? 'Доступ к помощнику запрещён'
							: status === 404
								? 'Диалог или генерация недоступны'
								: status === 409
									? 'Состояние диалога изменилось. Обновите диалог.'
									: status === 422
										? 'Проверьте сообщение и параметры запроса'
										: status === 429
											? 'Слишком много запросов. Попробуйте позже.'
											: 'Не удалось связаться с помощником. Попробуйте ещё раз.';

				if (history) this.historyError = message;
				else this.error = message;

				if (this.saving && status && status >= 400 && status < 500 && ![408, 419].includes(status)) {
					this.intent = null;
					this.persist();
				}

				if (this.saving) this.submissionError = this.intent ? message : null;

				if (status === 403 || status === 404) {
					this.messages = [];
					this.generations = {};
					this.generation = null;
					this.conversation = null;
					this.loaded = false;
				}
			});

			if (status === 401 || status === 419) this.endSession();
		} finally {
			if (this.controller === controller) {
				runInAction(() => {
					this.controller = null;
					this.loading = false;
					this.loadingHistory = false;
					this.saving = false;
					this.resumeOperations();
				});
			}
		}
	}

	private applyGeneration(g: AssistantGeneration, current = true): void {
		const finished = this.generation?.execution_pending && this.generation.id === g.id && !g.execution_pending;
		this.generations[g.user_message_id] = g;

		if (current) this.generation = g;
		if (g.status === 'succeeded' && g.response)
			this.merge([
				{ ...g.response, answer_generation: g.response.answer_generation ?? { ...g, response: null } },
			]);
		if (finished) void this.loadLimits();
	}

	private merge(messages: AssistantMessage[]): void {
		this.messages = [...new Map([...this.messages, ...messages].map((m) => [m.id, m])).values()].sort(
			(a, b) => a.sequence - b.sequence
		);
	}

	private schedule(): void {
		if (this.attached && this.generation?.execution_pending && !this.timer)
			this.timer = setTimeout(() => {
				runInAction(() => (this.timer = null));
				void this.poll();
			}, 1500);
	}

	private available(): boolean {
		return this.attached && !!this.owner && this.user.id === this.owner;
	}

	private key(): string {
		return `${LS_PREFIX}assistant_${this.owner}`;
	}

	private persist(): boolean {
		if (!this.owner || this.owner !== this.user.id) return false;

		try {
			storage.set(this.key(), { input: this.input, mode: this.mode, intent: this.intent });
			return true;
		} catch {
			this.error = 'Не удалось сохранить черновик локально';

			if (this.intent) this.submissionError = this.error;
			return false;
		}
	}

	private halt(): void {
		this.cancelArchiveRead();
		this.archiveSaving = false;
		this.refreshActive = false;
		this.pendingStopId = null;
		this.stopping = false;
		if (this.timer) clearTimeout(this.timer);
		this.timer = null;
		this.controller?.abort();
		this.controller = null;
	}

	constructor(
		private readonly user: IBaseUserPort,
		private readonly endSession: () => void,
		private readonly repo: IAssistantRepo
	) {
		super();

		makeObservable<
			this,
			| 'submissionError'
			| 'controller'
			| 'reset'
			| 'applyActiveSnapshot'
			| 'applyArchivedPage'
			| 'applyGeneration'
			| 'merge'
			| 'resumeOperations'
			| 'flushPendingStop'
		>(this, {
			searchEnabled: observable,
			limits: observable,
			limitsOpen: observable,
			limitsLoading: observable,
			limitsError: observable,
			view: observable,
			archiveItems: observable,
			search: observable,
			archivePage: observable,
			archiveHasMore: observable,
			archiveLoading: observable,
			archiveSaving: observable,
			archiveError: observable,
			archivedConversation: observable,
			archivedMessages: observable,
			archivedBefore: observable,
			input: observable,
			lastSubmittedMessageId: observable,
			mode: observable,
			conversation: observable,
			messages: observable,
			generation: observable,
			generations: observable,
			error: observable,
			historyError: observable,
			loaded: observable,
			loading: observable,
			loadingHistory: observable,
			saving: observable,
			stopping: observable,
			before: observable,
			intent: observable,
			submissionError: observable,
			controller: observable,

			generating: computed,
			busy: computed,
			isSyncing: computed,
			phase: computed,
			visibleMessages: computed,
			canSend: computed,
			canResumeConversation: computed,
			submissionRecovery: computed,
			regenerateMessageId: computed,

			setSearchEnabled: action,
			setLimitsOpen: action,
			loadLimits: action,
			attach: action,
			detach: action,
			setInput: action,
			setMode: action,
			load: action,
			loadOlder: action,
			send: action,
			repeatSubmission: action,
			retry: action,
			regenerate: action,
			stop: action,
			newConversation: action,
			resumeConversation: action,
			loadArchive: action,
			openArchived: action,
			loadArchivedOlder: action,
			pinArchive: action,
			deleteArchive: action,
			openArchive: action,
			returnActive: action,
			setSearch: action,
			applyArchivedPage: action,
			applyActiveSnapshot: action,
			applyGeneration: action,
			merge: action,
			resumeOperations: action,
			flushPendingStop: action,
			reset: action,
		});
	}

	init(): void {
		if (this.inited) return;
		this.inited = true;

		this.track(
			reaction(
				() => this.user.id,
				() => {
					this.reset();
					this.owner = this.user.id;

					if (!this.owner) return;

					try {
						const local = storage.get(this.key());

						if (typeof local?.input === 'string') this.input = local.input.slice(0, ASSISTANT_MAX_LENGTH);

						if (ASSISTANT_MODES.some(({ id }) => id === local?.mode)) this.mode = local.mode;

						const intent = local?.intent;
						if (
							intent?.kind === 'send' &&
							typeof intent.data?.request_id === 'string' &&
							typeof intent.data.content === 'string' &&
							(intent.data.search_enabled === undefined ||
								typeof intent.data.search_enabled === 'boolean') &&
							intent.data.content.length <= ASSISTANT_MAX_LENGTH &&
							(intent.data.conversation_id === null || typeof intent.data.conversation_id === 'string') &&
							ASSISTANT_MODES.some(({ id }) => id === intent.data.mode) &&
							typeof intent.draft === 'string'
						)
							this.intent = {
								...intent,
								data: { ...intent.data, search_enabled: intent.data.search_enabled ?? false },
							};
						if (
							(intent?.kind === 'retry' || intent?.kind === 'regenerate') &&
							typeof intent.id === 'string' &&
							typeof intent.requestId === 'string' &&
							(intent.searchEnabled === undefined || typeof intent.searchEnabled === 'boolean')
						)
							this.intent = intent;
					} catch {
						this.error = 'Не удалось прочитать сохранённый черновик';
					}

					if (this.intent)
						this.submissionError = 'Результат запроса не подтверждён. Повторите отправку для проверки.';
					if (this.attached) void this.load();
				},
				{ fireImmediately: true }
			)
		);
	}

	protected reset(): void {
		this.resumeRequest = null;
		this.searchEnabled = false;
		this.setLimitsOpen(false);
		this.limits = null;
		this.limitsError = null;
		this.halt();
		this.view = 'active';
		this.archiveItems = [];
		this.search = '';
		this.archivePage = 0;
		this.archiveHasMore = false;
		this.archiveError = null;
		this.archivedConversation = null;
		this.archivedMessages = [];
		this.archivedBefore = null;
		this.owner = null;
		this.input = '';
		this.lastSubmittedMessageId = null;
		this.mode = 'ask';
		this.messages = [];
		this.generations = {};
		this.generation = null;
		this.conversation = null;
		this.loaded = false;
		this.loading = false;
		this.loadingHistory = false;
		this.saving = false;
		this.stopping = false;
		this.before = null;
		this.error = null;
		this.historyError = null;
		this.intent = null;
		this.submissionError = null;
	}

	destroy(): void {
		this.detach();
		super.destroy();
		this.reset();
	}
}
