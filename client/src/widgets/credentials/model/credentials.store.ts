import { action, makeObservable, observable, reaction, runInAction } from 'mobx';

import type { UserStore } from '@/entities/user';
import { CredentialsConflictError } from '@/shared/lib/errors';
import { AsyncStore } from '@/shared/lib/store';

import { normalizeUrl } from '../lib/utils';
import { CREDENTIAL_LIMIT } from './constants';
import { emptyCredential } from './defaults';
import type { ICredentialsRepo } from './ports';
import type { Credential, CredentialInput, CredentialsSnapshot } from './types';

export class CredentialsStore extends AsyncStore {
	private initializing: Promise<void> | null = null;
	private orderPromise: Promise<void> | null = null;
	private pendingOrder: string[] | null = null;

	private controller = new AbortController();
	private generation = 0;
	private opening = 0;
	private baseline = '';

	entries: Credential[] = [];
	revision = 0;
	isReady = false;
	reordering = false;
	conflict = false;

	draft: CredentialInput | null = null;
	editingId: string | null = null;

	ensureLoaded(): Promise<void> {
		const userId = this.userStore.id;
		if (!userId || this.isReady) return Promise.resolve();

		if (this.initializing) return this.initializing;

		const promise = this.initialize(userId);

		this.initializing = promise;

		void promise
			.finally(() => {
				if (this.initializing === promise) this.initializing = null;
			})
			.catch(() => {});

		return promise;
	}

	async reload(): Promise<void> {
		if (!this.userStore.id || this.isLoading) return;

		await this.operation(async (signal, current) => {
			const snapshot = await this.repo.load(signal);

			if (current()) {
				runInAction(() => {
					this.apply(snapshot);
					this.clearEditor();
				});
			}
		});
	}

	addAccount(): void {
		if (this.isLoading || this.conflict || this.draft) return;

		if (this.entries.length >= CREDENTIAL_LIMIT) {
			this.setError(new Error(`Можно сохранить не больше ${CREDENTIAL_LIMIT} аккаунтов`));
			return;
		}

		this.draft = emptyCredential();
		this.editingId = null;
		this.baseline = JSON.stringify(this.draft);
		this.setError(null);
	}

	cancelOpening = (): void => {
		this.opening++;
	};

	async openAccount(id: string): Promise<void> {
		if (this.draft || this.conflict || this.isLoading) return;

		const opening = ++this.opening;

		await this.operation(async (signal, current) => {
			const [details, secret] = await Promise.all([this.repo.show(id, signal), this.repo.password(id, signal)]);

			if (!current() || opening !== this.opening) return;

			if (details.revision !== this.revision || secret.revision !== this.revision)
				throw new CredentialsConflictError();

			const { entry } = details;

			runInAction(() => {
				this.editingId = id;
				this.draft = {
					service: entry.service,
					login: entry.login ?? '',
					password: secret.password,
					comment: entry.comment ?? '',
					url: entry.url ?? '',
					color: entry.color,
				};

				this.baseline = JSON.stringify(this.draft);
			});
		});
	}

	updateField<K extends keyof CredentialInput>(field: K, value: CredentialInput[K]): void {
		if (!this.draft || this.isLoading) return;
		this.draft[field] = value;
	}

	async closeEditor(): Promise<void> {
		if (!this.draft || this.isLoading) return;

		if (this.conflict) {
			this.setError(new CredentialsConflictError());
			return;
		}

		const input = { ...this.draft, service: this.draft.service.trim(), url: normalizeUrl(this.draft.url) };

		if (JSON.stringify(input) === this.baseline) {
			this.clearEditor();
			return;
		}

		if (!input.service) {
			this.setError(new Error('Укажите название сервиса'));
			return;
		}

		if (input.url) {
			try {
				const url = new URL(input.url);
				if (!['http:', 'https:'].includes(url.protocol) || !url.hostname) throw new Error();
			} catch {
				this.setError(new Error('Укажите корректный адрес сайта'));
				return;
			}
		}

		const id = this.editingId;
		const updates: Partial<CredentialInput> = { ...input };

		if (id && input.password === (JSON.parse(this.baseline) as CredentialInput).password) delete updates.password;

		await this.operation(async (signal, current) => {
			const snapshot = id
				? await this.repo.update(id, updates, this.revision, signal)
				: await this.repo.create(input, this.revision, signal);

			if (current()) {
				runInAction(() => {
					this.apply(snapshot);
					this.clearEditor();
				});
			}
		});
	}

	async remove(id: string): Promise<void> {
		if (this.conflict || (this.draft && this.editingId !== id)) return;

		await this.operation(async (signal, current) => {
			const snapshot = await this.repo.remove(id, this.revision, signal);

			if (current()) {
				runInAction(() => {
					this.apply(snapshot);

					if (this.editingId === id) this.clearEditor();
				});
			}
		});
	}

	async color(id: string, color: CredentialInput['color']): Promise<void> {
		if (this.entries.find((entry) => entry.id === id)?.color === color) return;

		await this.write((signal) => this.repo.update(id, { color }, this.revision, signal));
	}

	async reorder(ids: string[]): Promise<void> {
		if (!this.userStore.id || this.conflict || this.draft || (this.isLoading && !this.reordering)) return;

		if (!this.validOrder(ids)) return;

		const previous = this.entries.map((entry) => ({ ...entry }));

		this.setOrder(ids);
		this.pendingOrder = [...ids];

		if (this.reordering) return this.orderPromise ?? Promise.resolve();

		this.reordering = true;

		const promise = this.operation(async (signal, current) => {
			let confirmed = previous;

			try {
				while (this.pendingOrder && current()) {
					const order = this.pendingOrder;

					runInAction(() => (this.pendingOrder = null));

					const snapshot = await this.repo.reorder(order, this.revision, signal);

					if (!current()) return;

					runInAction(() => {
						this.apply(snapshot);
						confirmed = this.entries.map((entry) => ({ ...entry }));

						if (this.pendingOrder) this.setOrder(this.pendingOrder);
					});
				}
			} catch (error) {
				if (current()) {
					runInAction(() => {
						this.entries = confirmed;
						this.pendingOrder = null;
					});
				}

				throw error;
			} finally {
				if (current()) runInAction(() => (this.reordering = false));
			}
		});

		this.orderPromise = promise;

		try {
			await promise;
		} finally {
			if (this.orderPromise === promise) this.orderPromise = null;
		}
	}

	async readPassword(id: string): Promise<string> {
		const generation = this.generation;
		const userId = this.userStore.id;
		if (!userId) throw new Error('Необходима авторизация');

		const secret = await this.repo.password(id, this.controller.signal);

		if (generation !== this.generation || this.userStore.id !== userId) throw new Error('Сессия изменилась');

		if (secret.revision !== this.revision) {
			const error = new CredentialsConflictError();

			runInAction(() => {
				this.conflict = true;
				this.setError(error);
			});

			throw error;
		}

		return secret.password;
	}

	private async initialize(userId: string): Promise<void> {
		await this.operation(async (signal, current) => {
			let snapshot = await this.repo.load(signal);

			if (!current() || this.userStore.id !== userId) return;

			if (snapshot.revision === 0 && snapshot.entries.length === 0) snapshot = await this.repo.initialize(signal);

			if (current()) runInAction(() => this.apply(snapshot));
		});
	}

	private async operation(task: (signal: AbortSignal, current: () => boolean) => Promise<void>): Promise<void> {
		const userId = this.userStore.id;
		if (!userId || this.isLoading) return;

		const generation = this.generation;
		const signal = this.controller.signal;
		const current = () => this.userStore.id === userId && this.generation === generation;

		try {
			await this.withLoading(async () => {
				await task(signal, current);
			});
		} catch (error) {
			if (!current() || signal.aborted) return;

			runInAction(() => {
				if (error instanceof CredentialsConflictError) this.conflict = true;
			});
		}
	}

	private async write(task: (signal: AbortSignal) => Promise<CredentialsSnapshot>): Promise<void> {
		if (this.conflict || this.draft) return;

		await this.operation(async (signal, current) => {
			const snapshot = await task(signal);

			if (current()) runInAction(() => this.apply(snapshot));
		});
	}

	private validOrder(ids: string[]): boolean {
		const existing = new Set(this.entries.map((entry) => entry.id));
		return ids.length === existing.size && new Set(ids).size === ids.length && ids.every((id) => existing.has(id));
	}

	private setOrder(ids: string[]): void {
		const entries = new Map(this.entries.map((entry) => [entry.id, entry]));
		this.entries = ids.map((id, order_idx) => ({ ...entries.get(id)!, order_idx }));
	}

	private apply(snapshot: CredentialsSnapshot): void {
		this.entries = snapshot.entries.map((entry) => ({
			...entry,
			login: entry.login ?? '',
			comment: entry.comment ?? '',
			url: entry.url ?? '',
		}));

		this.revision = snapshot.revision;
		this.isReady = true;
		this.conflict = false;
		this.setError(null);
	}

	private clearEditor(): void {
		this.draft = null;
		this.editingId = null;
		this.baseline = '';
	}

	constructor(
		private readonly userStore: UserStore,
		private readonly repo: ICredentialsRepo & { reset?: () => void }
	) {
		super();

		makeObservable<this, 'apply' | 'clearEditor' | 'setOrder' | 'reset'>(this, {
			entries: observable,
			revision: observable,
			isReady: observable,
			reordering: observable,
			conflict: observable,
			draft: observable,
			editingId: observable,

			addAccount: action,
			cancelOpening: action,
			updateField: action,
			apply: action,
			clearEditor: action,
			setOrder: action,
			reset: action,
		});
	}

	init(): void {
		if (this.inited) return;
		this.inited = true;

		this.track(
			reaction(
				() => [this.userStore.id, this.userStore.userRole] as const,
				() => this.reset(),
				{ equals: (previous, current) => previous[0] === current[0] && previous[1] === current[1] }
			)
		);
	}

	protected reset(): void {
		this.controller.abort();
		this.controller = new AbortController();

		this.initializing = null;
		this.orderPromise = null;
		this.pendingOrder = null;

		this.generation++;
		this.opening++;
		this.baseline = '';

		this.entries = [];
		this.revision = 0;
		this.isReady = false;
		this.reordering = false;
		this.conflict = false;

		this.clearEditor();
		this.setError(null);

		this.repo.reset?.();
	}
}
