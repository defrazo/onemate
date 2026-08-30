import { action, computed, makeObservable, observable, reaction } from 'mobx';

import type { IBaseUserPort } from '@/entities/user';
import { AsyncStore, Debouncer } from '@/shared/lib/store';
import { generateUUID } from '@/shared/lib/utils';

import { notesCache } from '../lib';
import type { INotesRepo, Note } from '.';

export class NotesStore extends AsyncStore {
	private readonly debouncer = new Debouncer();
	private lastSnapshot = '';

	notes: Note[] = [];
	draft: Note[] = [];
	focusedId: string | null = null;

	get isReady(): boolean {
		return this.notes.length > 0;
	}

	private get canAddMore(): boolean {
		return this.draft.length < 50;
	}

	private get canDeleteMore(): boolean {
		return this.draft.length > 1;
	}

	setFocusedId(id: string | null): void {
		this.focusedId = id;
	}

	updateNote<K extends keyof Note>(id: string, key: K, value: Note[K]): void {
		const index = this.draft.findIndex((note) => note.id === id);
		if (index === -1) return;

		this.draft[index] = { ...this.draft[index], [key]: value, updated_at: new Date().toISOString() };
		this.persistDraft();
	}

	updateOrder(newNotes: Note[]): void {
		this.draft = [...newNotes];
		this.commitDraft();
		this.scheduleServerUpdate();
	}

	addNote(): void {
		if (!this.canAddMore) throw new Error('Максимум 50 заметок');

		const maxOrder = this.draft.length ? Math.max(...this.draft.map((note) => note.order_idx)) + 1 : 0;
		const now = new Date().toISOString();
		const note: Note = { id: generateUUID(), text: '', order_idx: maxOrder, created_at: now, updated_at: now };

		this.draft.push(note);
		this.commitDraft();
		this.scheduleServerUpdate();
	}

	removeNote(id: string): void {
		if (!this.canDeleteMore) throw new Error('Нельзя удалить все заметки');

		this.draft = this.draft.filter((note) => note.id !== id);
		this.commitDraft();
		this.scheduleServerUpdate();
	}

	async loadNotes(userId: string): Promise<void> {
		const cached = notesCache.read(userId);

		if (cached?.dirty) {
			const sorted = this.sortNotes(cached.notes);

			this.applyDirtyDraft(sorted);
			this.scheduleServerUpdate();

			return;
		}

		if (cached) this.applyNotes(this.sortNotes(cached.notes));

		if (this.isLoading) return;

		await this.withLoading(async () => {
			const notes = await this.repo.loadAll(userId);

			if (this.userStore.id !== userId) return;

			const sorted = this.sortNotes(notes);
			this.applyNotes(sorted);
			notesCache.write(userId, sorted, false);
		});
	}

	private scheduleServerUpdate(): void {
		const userId = this.userStore.id;
		if (!userId) return;

		this.debouncer.schedule(() => void this.syncDraftToServer(userId), 500);
	}

	private async syncDraftToServer(userId: string): Promise<void> {
		if (this.userStore.id !== userId || !this.hasDraftChanged() || this.focusedId) return;

		const draft = this.draft.map((note) => ({ ...note }));

		try {
			await this.repo.replaceAll(userId, draft);

			if (this.userStore.id !== userId) return;

			this.applyNotes(draft);
			notesCache.write(userId, draft, false);
		} catch {}
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
		const userId = this.userStore.id;
		if (!userId) return;

		notesCache.write(
			userId,
			this.draft.map((note) => ({ ...note })),
			true
		);
	}

	private sortNotes(notes: Note[]): Note[] {
		return [...notes].sort((a, b) => a.order_idx - b.order_idx);
	}

	private getDraftSnapshot(): string {
		return JSON.stringify(this.draft.map(({ id, text, order_idx }) => ({ id, text, order_idx })));
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

		makeObservable<this, 'canAddMore' | 'canDeleteMore' | 'reset' | 'applyNotes' | 'applyDirtyDraft'>(this, {
			notes: observable,
			draft: observable,
			focusedId: observable,

			isReady: computed,
			canAddMore: computed,
			canDeleteMore: computed,

			setFocusedId: action,
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
				() => this.focusedId,
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
				(id) => {
					if (!id) {
						this.reset();
						return;
					}

					void this.loadNotes(id);
				},
				{ fireImmediately: true }
			)
		);
	}

	protected reset(): void {
		this.notes = [];
		this.draft = [];
		this.focusedId = null;
		this.lastSnapshot = '';

		this.debouncer.cancel();
	}
}
