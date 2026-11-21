import axios from 'axios';
import { action, computed, makeObservable, observable, reaction, runInAction } from 'mobx';

import type { IBaseUserPort } from '@/entities/user';
import { NotesConflictError } from '@/shared/lib/errors';
import { AsyncStore, Debouncer } from '@/shared/lib/store';
import { generateUUID, getRandomPaletteColor } from '@/shared/lib/utils';

import { notesCache } from '../lib/notesCache';
import { acquireNotesWriter } from '../lib/notesWriter';
import type { INotesRepo } from './ports';
import type { Note, NotesSnapshot } from './types';

const snapshotOf = (notes: Note[]): string =>
	JSON.stringify(notes.map(({ id, text, color }, order_idx) => ({ id, text, color, order_idx })));

export class NotesStore extends AsyncStore {
	private readonly debouncer = new Debouncer();
	private readonly requests = new Set<AbortController>();

	private initializing: Promise<void> | null = null;
	private savingPromise: Promise<void> | null = null;
	private loaded = false;
	private verified = false;

	private lastSnapshot = '[]';
	private generation = 0;
	private draftVersion = 0;
	private revision: number | null = null;
	private pendingSnapshot: string | null = null;
	private uncertain = false;
	private owner: string | null = null;
	private lease: ReturnType<typeof acquireNotesWriter> | null = null;
	private preparing: Promise<void> = Promise.resolve();
	private foreignDraft = false;

	notes: Note[] = [];
	draft: Note[] = [];
	activeNoteId: string | null = null;
	saving = false;
	syncError: Error | null = null;
	conflict = false;

	get isReady(): boolean {
		return this.loaded;
	}

	get activeNote(): Note | null {
		return this.draft.find((note) => note.id === this.activeNoteId) ?? null;
	}

	get dirty(): boolean {
		const current = snapshotOf(this.draft);
		return current !== this.lastSnapshot || this.uncertain || (this.saving && this.pendingSnapshot !== current);
	}

	get isSyncing(): boolean {
		return this.saving;
	}

	private get writer(): string {
		return this.lease?.writer ?? this.preferredWriter ?? '';
	}

	private get canWrite(): boolean {
		return this.inited && this.lease?.owns === true && !this.foreignDraft;
	}

	ensureLoaded(): Promise<void> {
		const userId = this.userStore.id;
		if (!this.inited || !userId || this.verified) return Promise.resolve();

		if (this.initializing) return this.initializing;

		const generation = this.generation;
		const promise = this.preparing.then(() => {
			if (this.current(userId, generation)) return this.loadNotes(userId);
		});

		this.initializing = promise;

		void promise
			.finally(() => {
				if (this.initializing === promise) this.initializing = null;
			})
			.catch(() => {});

		return promise;
	}

	openNote(id: string): void {
		this.activeNoteId = id;
	}

	closeNote(): void {
		this.activeNoteId = null;
	}

	updateNote<K extends keyof Note>(id: string, key: K, value: Note[K]): void {
		if (!this.canWrite) return;

		const index = this.draft.findIndex((note) => note.id === id);
		if (index < 0) return;

		this.draft[index] = { ...this.draft[index], [key]: value, updated_at: new Date().toISOString() };
		this.persistDraft();
	}

	updateOrder(notes: Note[]): void {
		if (!this.canWrite) return;

		this.draft = this.normalizeOrder(notes);
		this.commitDraft();
		this.scheduleServerUpdate();
	}

	addNote(): string {
		if (!this.canWrite) throw new Error('Не получено владение черновиком');
		if (this.draft.length >= 50) throw new Error('Максимум 50 заметок');

		const now = new Date().toISOString();
		const note: Note = {
			id: generateUUID(),
			text: '',
			color: getRandomPaletteColor(),
			order_idx: 0,
			created_at: now,
			updated_at: now,
		};

		this.draft = this.normalizeOrder([note, ...this.draft]);
		this.commitDraft();
		this.scheduleServerUpdate();
		return note.id;
	}

	removeNote(id: string): void {
		if (!this.canWrite) throw new Error('Не получено владение черновиком');
		if (this.draft.length <= 1) throw new Error('Нельзя удалить все заметки');

		this.draft = this.normalizeOrder(this.draft.filter((note) => note.id !== id));
		this.commitDraft();
		this.scheduleServerUpdate();
	}

	async retry(): Promise<void> {
		if (this.conflict) return;

		runInAction(() => (this.syncError = null));

		await this.ensureLoaded();
		await this.save(true);
	}

	async flushForLogout(): Promise<void> {
		this.debouncer.cancel();

		await this.ensureLoaded();

		if (this.conflict) throw new NotesConflictError(this.revision ?? 0);

		await this.save(true);

		if (!this.inited) throw new Error('Экземпляр заметок остановлен');
		if (this.hasUnsavedNotes()) throw new Error('Есть несохранённые черновики в других вкладках');
	}

	hasUnsavedNotes(): boolean {
		if (this.dirty) return true;

		const userId = this.userStore.id;
		if (!userId) return false;

		try {
			return notesCache.readAll(userId).some((draft) => snapshotOf(draft.notes) !== this.lastSnapshot);
		} catch {
			return true;
		}
	}

	getRecoveryText(): string {
		const userId = this.userStore.id;
		if (!userId) return '';

		try {
			return JSON.stringify({ notes: this.draft, drafts: notesCache.readAll(userId) }, null, 2);
		} catch {
			return JSON.stringify({ notes: this.draft }, null, 2);
		}
	}

	async loadServerVersion(): Promise<void> {
		if (!this.inited) return;
		await this.preparing;
		if (!this.inited) return;

		const userId = this.userStore.id;
		if (!userId) return;

		if (this.savingPromise) await this.savingPromise.catch(() => {});
		if (!this.inited) return;

		const generation = this.generation;
		const version = this.draftVersion;
		const controller = this.request();

		try {
			const server = await this.repo.loadAll(userId, controller.signal);

			if (!this.current(userId, generation) || version !== this.draftVersion) return;

			this.validateOwner(server, userId);

			runInAction(() => {
				this.applySnapshot(server);
				this.conflict = false;
				this.syncError = null;
				this.verified = true;
			});

			if (this.lease?.owns) notesCache.discardOwn(userId, this.writer);
			notesCache.discardLegacy(userId);
		} catch (error) {
			if (!this.current(userId, generation)) return;

			this.handleFailure(error);

			throw error;
		} finally {
			this.requests.delete(controller);
		}
	}

	discardForLogout(userId: string): void {
		if (!this.inited || this.userStore.id !== userId) return;

		notesCache.discardAll(userId);
		this.reset();
	}

	private async loadNotes(userId: string): Promise<void> {
		const generation = this.generation;
		const controller = this.request();

		runInAction(() => {
			this.syncError = null;
			this.setError(null);
		});

		try {
			let server = await this.repo.loadAll(userId, controller.signal);

			if (!this.current(userId, generation)) return;

			this.validateOwner(server, userId);

			if (this.canWrite && !this.conflict && server.notes.length === 0 && !this.dirty && server.revision === 0) {
				server = await this.repo.initialize(userId, controller.signal);

				if (!this.current(userId, generation)) return;

				this.validateOwner(server, userId);
			}
			runInAction(() => {
				if (!this.conflict && (!this.dirty || snapshotOf(this.draft) === snapshotOf(server.notes))) {
					this.applySnapshot(server);
					if (this.canWrite) notesCache.discardOwn(userId, this.writer);
				} else if (this.revision === null || this.revision !== server.revision || this.conflict) {
					this.conflict = true;
				} else {
					this.lastSnapshot = snapshotOf(server.notes);
				}

				this.loaded = true;
				this.verified = true;

				if (!this.lease?.owns) this.syncError = new Error('Не удалось получить владение черновиком');
			});

			if (this.dirty && !this.conflict) {
				this.persistDraft(false);
				this.scheduleServerUpdate();
			}
		} catch (error) {
			if (!this.current(userId, generation)) return;

			this.handleFailure(error);
			throw error;
		} finally {
			this.requests.delete(controller);
		}
	}

	private scheduleServerUpdate(): void {
		if (!this.canWrite || !this.verified || this.conflict || this.syncError) return;
		this.debouncer.schedule(() => void this.save().catch(() => {}), 500);
	}

	private async save(force = false): Promise<void> {
		if (!this.canWrite) throw new Error('Не получено владение черновиком');

		if (this.savingPromise) {
			await this.savingPromise;
			if (force && this.dirty) await this.save(true);
			return;
		}

		const userId = this.userStore.id;
		if (!userId || !this.verified || !this.dirty || (!force && this.activeNoteId)) return;

		if (this.conflict || this.revision === null) throw new NotesConflictError(this.revision ?? 0);

		const promise = this.send(userId);
		this.savingPromise = promise;

		try {
			await promise;
		} finally {
			if (this.savingPromise === promise) this.savingPromise = null;
		}
	}

	private async send(userId: string): Promise<void> {
		const generation = this.generation;
		const version = this.draftVersion;
		const draft = this.normalizeOrder(this.draft);
		const controller = this.request();

		this.pendingSnapshot = snapshotOf(draft);

		runInAction(() => {
			this.saving = true;
			this.syncError = null;
		});

		let saved = false;

		try {
			const server = await this.repo.replaceAll(userId, draft, this.revision!, controller.signal);

			if (!this.current(userId, generation)) return;

			this.validateOwner(server, userId);

			runInAction(() => {
				this.revision = server.revision;
				this.lastSnapshot = snapshotOf(server.notes);
				this.uncertain = false;
				if (this.draftVersion === version) this.applySnapshot(server);
			});

			notesCache.acknowledge(userId, this.writer, version);
			this.persistDraft(false);
			saved = true;
		} catch (error) {
			if (!this.current(userId, generation)) return;

			runInAction(() => (this.uncertain = true));
			this.handleFailure(error);
			throw error;
		} finally {
			this.requests.delete(controller);
			if (this.current(userId, generation)) {
				runInAction(() => {
					this.saving = false;
					this.pendingSnapshot = null;
				});
				if (saved && this.dirty && !this.activeNoteId) this.scheduleServerUpdate();
			}
		}
	}

	private handleFailure(error: unknown): void {
		runInAction(() => {
			this.syncError = this.asError(error);
			this.setError(this.syncError);
			if (error instanceof NotesConflictError) this.conflict = true;
		});

		this.persistDraft(false);

		if (axios.isAxiosError(error) && [401, 419].includes(error.response?.status ?? 0)) this.onSessionLost();
	}

	private validateOwner(server: NotesSnapshot, userId: string): void {
		if (server.user_id !== userId || !Number.isSafeInteger(server.revision) || server.revision < 0)
			throw new Error('Сессия заметок изменилась');
	}

	private current(userId: string, generation: number): boolean {
		return this.inited && this.userStore.id === userId && this.generation === generation;
	}

	private request(): AbortController {
		const controller = new AbortController();
		this.requests.add(controller);
		return controller;
	}

	private asError(error: unknown): Error {
		return error instanceof Error ? error : new Error(String(error));
	}

	private normalizeOrder(notes: Note[]): Note[] {
		return notes.map((note, order_idx) => ({ ...note, order_idx }));
	}

	private commitDraft(): void {
		this.notes = this.draft.map((note) => ({ ...note }));
		this.persistDraft();
	}

	private persistDraft(increment = true): void {
		if (increment) this.draftVersion++;

		const userId = this.owner;
		if (!userId || !this.canWrite) return;

		try {
			if (!this.dirty) {
				notesCache.discardOwn(userId, this.writer);
				return;
			}

			notesCache.write(userId, this.writer, {
				notes: this.draft.map((note) => ({ ...note })),
				revision: this.revision,
				version: this.draftVersion,
				conflict: this.conflict,
			});
		} catch (error) {
			runInAction(() => (this.syncError = this.asError(error)));
		}
	}

	private applySnapshot(server: NotesSnapshot): void {
		this.foreignDraft = false;
		this.notes = this.normalizeOrder(server.notes);
		this.draft = this.notes.map((note) => ({ ...note }));
		this.revision = server.revision;
		this.lastSnapshot = snapshotOf(this.draft);
		this.loaded = true;
		this.conflict = false;
		this.uncertain = false;
		this.syncError = null;
		this.setError(null);
	}

	private async restoreDraft(userId: string, generation: number): Promise<void> {
		await this.lease?.ready;

		if (!this.current(userId, generation)) return;

		try {
			const cached = notesCache.read(userId, this.writer);
			if (!cached) return;

			runInAction(() => {
				this.foreignDraft = !this.lease?.owns || cached.writer !== this.writer;
				this.draft = this.normalizeOrder(cached.notes);
				this.notes = this.draft.map((note) => ({ ...note }));
				this.revision = cached.revision;
				this.draftVersion = this.foreignDraft ? 0 : cached.version;
				this.conflict = cached.conflict === true || this.foreignDraft || cached.revision === null;
				this.loaded = true;
			});
		} catch (error) {
			runInAction(() => (this.syncError = this.asError(error)));
		}
	}

	constructor(
		private readonly userStore: IBaseUserPort,
		private readonly repo: INotesRepo,
		private readonly preferredWriter?: string,
		private readonly onSessionLost: () => void = () => {}
	) {
		super();
		makeObservable<this, 'loaded' | 'lastSnapshot' | 'uncertain' | 'reset' | 'applySnapshot'>(this, {
			loaded: observable,
			lastSnapshot: observable,
			notes: observable,
			draft: observable,
			activeNoteId: observable,
			saving: observable,
			syncError: observable,
			conflict: observable,
			uncertain: observable,
			isReady: computed,
			activeNote: computed,
			dirty: computed,
			isSyncing: computed,
			openNote: action,
			closeNote: action,
			updateNote: action,
			updateOrder: action,
			addNote: action,
			removeNote: action,
			reset: action,
			applySnapshot: action,
		});
	}

	init(): void {
		if (this.inited) return;
		this.inited = true;

		this.lease = acquireNotesWriter(() => this.destroy(), this.preferredWriter);
		this.track(
			reaction(
				() => this.userStore.id,
				action((userId) => {
					this.reset();
					this.owner = userId;
					if (!userId) return;
					this.preparing = this.restoreDraft(userId, this.generation);
				}),
				{ fireImmediately: true }
			)
		);
		this.track(
			reaction(
				() => this.activeNoteId,
				(id) => {
					if (id === null && this.dirty) this.scheduleServerUpdate();
				}
			)
		);
	}

	override destroy(): void {
		if (!this.inited) return;

		const pending = Promise.allSettled([this.initializing, this.savingPromise]);
		this.reset();
		super.destroy();
		this.lease?.release(pending);
		this.lease = null;
	}

	protected reset(): void {
		this.foreignDraft = false;
		this.generation++;
		for (const request of this.requests) request.abort();
		this.requests.clear();
		this.debouncer.cancel();
		this.initializing = null;
		this.savingPromise = null;
		this.verified = false;
		this.loaded = false;
		this.saving = false;
		this.pendingSnapshot = null;
		this.uncertain = false;
		this.syncError = null;
		this.conflict = false;
		this.revision = null;
		this.owner = null;
		this.notes = [];
		this.draft = [];
		this.activeNoteId = null;
		this.lastSnapshot = '[]';
		this.setError(null);
	}
}
