import { action, computed, makeObservable, observable, reaction, runInAction } from 'mobx';

import type { IBaseUserPort } from '@/entities/user';
import { AsyncStore, Debouncer } from '@/shared/lib/store';
import { generateUUID, getRandomPaletteColor } from '@/shared/lib/utils';

import { notesCache } from '../lib';
import type { INotesRepo, Note } from '.';

export class NotesStore extends AsyncStore {
	private readonly debouncer = new Debouncer();

	private initializing: Promise<void> | null = null;
	private loaded = false;

	private lastSnapshot = '';
	private isSaving = false;
	private generation = 0;
	private draftVersion = 0;

	notes: Note[] = [];
	draft: Note[] = [];
	activeNoteId: string | null = null;

	get isReady(): boolean {
		return this.loaded;
	}

	get activeNote(): Note | null {
		if (!this.activeNoteId) return null;
		return this.draft.find((note) => note.id === this.activeNoteId) ?? null;
	}

	private get canAddMore(): boolean {
		return this.draft.length < 50;
	}

	private get canDeleteMore(): boolean {
		return this.draft.length > 1;
	}

	get isSyncing(): boolean {
		return this.getDraftSnapshot() !== this.lastSnapshot;
	}

	ensureLoaded(): Promise<void> {
		const userId = this.userStore.id;
		if (!userId || this.loaded) return Promise.resolve();

		if (this.initializing) return this.initializing;

		const promise = this.loadNotes(userId);
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
		const idx = this.draft.findIndex((note) => note.id === id);
		if (idx === -1) return;

		this.draft[idx] = { ...this.draft[idx], [key]: value, updated_at: new Date().toISOString() };
		this.persistDraft();
	}

	updateOrder(newNotes: Note[]): void {
		this.draft = this.normalizeOrder(newNotes);
		this.commitDraft();
		this.scheduleServerUpdate();
	}

	addNote(): string {
		if (!this.canAddMore) throw new Error('Максимум 50 заметок');

		const maxOrder = this.draft.length ? Math.max(...this.draft.map((note) => note.order_idx)) + 1 : 0;
		const now = new Date().toISOString();
		const note: Note = {
			id: generateUUID(),
			text: '',
			color: getRandomPaletteColor(),
			order_idx: maxOrder,
			created_at: now,
			updated_at: now,
		};

		this.draft = this.normalizeOrder([note, ...this.draft]);
		this.commitDraft();
		this.scheduleServerUpdate();

		return note.id;
	}

	removeNote(id: string): void {
		if (!this.canDeleteMore) throw new Error('Нельзя удалить все заметки');

		this.draft = this.draft.filter((note) => note.id !== id);
		this.commitDraft();
		this.scheduleServerUpdate();
	}

	private async loadNotes(userId: string): Promise<void> {
		const generation = this.generation;
		const cached = notesCache.read(userId);

		if (cached?.dirty) {
			const sorted = this.sortNotes(cached.notes);

			runInAction(() => {
				this.applyDirtyDraft(sorted);
				this.loaded = true;
			});

			this.scheduleServerUpdate();
			return;
		}

		if (cached && this.userStore.id === userId && this.generation === generation)
			this.applyNotes(this.sortNotes(cached.notes));

		await this.withLoading(async () => {
			const draftVersion = this.draftVersion;
			const notes = await this.repo.loadAll(userId);

			if (this.userStore.id !== userId || this.generation !== generation || this.draftVersion !== draftVersion)
				return;

			const sorted = this.sortNotes(notes);

			runInAction(() => {
				this.applyNotes(sorted);
				this.loaded = true;
			});

			notesCache.write(userId, sorted, false);
		});
	}

	private scheduleServerUpdate(): void {
		const userId = this.userStore.id;
		if (!userId) return;

		this.debouncer.schedule(() => void this.syncDraftToServer(userId), 500);
	}

	private async syncDraftToServer(userId: string): Promise<void> {
		if (this.userStore.id !== userId || this.isSaving || !this.hasDraftChanged() || this.activeNoteId) return;

		const generation = this.generation;
		const draft = this.draft.map((note) => ({ ...note }));
		const snapshot = this.getDraftSnapshot();

		this.isSaving = true;

		let saved = false;

		try {
			await this.repo.replaceAll(userId, draft);

			if (this.userStore.id !== userId || this.generation !== generation) return;
			runInAction(() => (this.lastSnapshot = snapshot));

			saved = true;

			if (this.getDraftSnapshot() === snapshot) notesCache.write(userId, draft, false);
		} catch {
		} finally {
			if (this.generation === generation) {
				this.isSaving = false;

				if (saved && this.userStore.id === userId && this.hasDraftChanged() && !this.activeNoteId)
					this.scheduleServerUpdate();
			}
		}
	}

	private applyNotes(notes: Note[]): void {
		const copy = notes.map((note) => ({ ...note }));

		this.notes = copy;
		this.draft = copy.map((note) => ({ ...note }));

		this.updateSnapshot();
	}

	private applyDirtyDraft(notes: Note[]): void {
		const copy = notes.map((note) => ({ ...note }));

		this.notes = copy;
		this.draft = copy.map((note) => ({ ...note }));
	}

	private commitDraft(): void {
		this.notes = this.draft.map((note) => ({ ...note }));
		this.persistDraft();
	}

	private persistDraft(): void {
		this.draftVersion++;

		const userId = this.userStore.id;
		if (!userId) return;

		notesCache.write(
			userId,
			this.draft.map((note) => ({ ...note })),
			true
		);
	}

	private normalizeOrder(notes: Note[]): Note[] {
		return notes.map((note, index) => ({ ...note, order_idx: index }));
	}

	private sortNotes(notes: Note[]): Note[] {
		return [...notes].sort((a, b) => a.order_idx - b.order_idx);
	}

	private getDraftSnapshot(): string {
		return JSON.stringify(this.draft.map(({ id, text, color, order_idx }) => ({ id, text, color, order_idx })));
	}

	private updateSnapshot(): void {
		this.lastSnapshot = this.getDraftSnapshot();
	}

	private hasDraftChanged(): boolean {
		return this.getDraftSnapshot() !== this.lastSnapshot;
	}

	constructor(
		private readonly userStore: IBaseUserPort,
		private readonly repo: INotesRepo
	) {
		super();

		makeObservable<
			this,
			'loaded' | 'canAddMore' | 'canDeleteMore' | 'lastSnapshot' | 'reset' | 'applyNotes' | 'applyDirtyDraft'
		>(this, {
			loaded: observable,
			notes: observable,
			draft: observable,
			activeNoteId: observable,
			lastSnapshot: observable,

			activeNote: computed,
			isReady: computed,
			canAddMore: computed,
			canDeleteMore: computed,
			isSyncing: computed,

			openNote: action,
			closeNote: action,
			updateNote: action,
			updateOrder: action,
			addNote: action,
			removeNote: action,

			applyNotes: action,
			applyDirtyDraft: action,
			reset: action,
		});

		this.track(
			reaction(
				() => this.activeNoteId,
				(focused) => {
					if (focused === null && this.hasDraftChanged()) this.scheduleServerUpdate();
				}
			)
		);
	}

	init(): void {
		if (this.inited) return;
		this.inited = true;

		this.track(
			reaction(
				() => this.userStore.id,
				(userId) => {
					this.reset();
					if (!userId) return;

					const cached = notesCache.read(userId);
					if (cached?.dirty) {
						this.applyDirtyDraft(this.sortNotes(cached.notes));
						this.scheduleServerUpdate();
					}
				},
				{ fireImmediately: true }
			)
		);
	}

	protected reset(): void {
		this.generation++;
		this.initializing = null;
		this.loaded = false;
		this.isSaving = false;

		this.notes = [];
		this.draft = [];
		this.activeNoteId = null;
		this.lastSnapshot = '';

		this.debouncer.cancel();
		this.setError(null);
	}
}
