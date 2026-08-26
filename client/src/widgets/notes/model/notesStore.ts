import { makeAutoObservable, reaction } from 'mobx';

import type { IBaseUserPort } from '@/entities/user';
import { notesChannel } from '@/shared/lib/broadcast';
import { storage } from '@/shared/lib/storage';
import { generateUUID, key } from '@/shared/lib/utils';
import type { Status } from '@/shared/stores';

import type { INotesRepo, Note } from '.';

export class NotesStore {
	private debounce: ReturnType<typeof setTimeout> | null = null;
	private disposers = new Set<() => void>();
	private inited: boolean = false;
	private status: Status = 'idle';
	private error: string | null = null;

	private lastSnapshot: string = '';

	notes: Note[] = [];
	draft: Note[] = [];
	focusedId: string | null = null;

	get isLoading(): boolean {
		return this.status === 'loading';
	}

	get isReady(): boolean {
		return this.status === 'ready' && this.notes.length > 0;
	}

	get isError(): boolean {
		return this.status === 'error';
	}

	get errorMessage(): string | null {
		return this.error;
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
		const index = this.draft.findIndex((n) => n.id === id);

		if (index !== -1) {
			const draft = this.draft[index];
			this.draft[index] = { ...draft, [key]: value, updated_at: new Date().toISOString() };
		}
	}

	updateOrder(newNotes: Note[]): void {
		this.draft = [...newNotes];
		this.setReady([...this.draft]);
		this.scheduleServerUpdate();

		notesChannel.emit('notes_reordered');
	}

	addNote(): void {
		if (!this.canAddMore) throw new Error('Максимум 50 заметок');

		const maxOrder = this.draft.length ? Math.max(...this.draft.map((n) => n.order_idx)) + 1 : 0;
		const newNote: Note = {
			id: generateUUID(),
			text: '',
			order_idx: maxOrder,
			created_at: new Date().toISOString(),
			updated_at: new Date().toISOString(),
		};

		this.draft.push(newNote);
		this.setReady([...this.draft]);
		this.scheduleServerUpdate();

		notesChannel.emit('note_added');
	}

	removeNote(id: string): void {
		if (!this.canDeleteMore) throw new Error('Нельзя удалить все заметки');

		this.draft = this.draft.filter((n) => n.id !== id);
		this.setReady([...this.draft]);
		this.scheduleServerUpdate();

		notesChannel.emit('note_removed');
	}

	async loadNotes(): Promise<void> {
		if (!this.userStore.id || this.isLoading) return;

		this.setLoading();

		try {
			const notes = await this.repo.loadAll(this.userStore.id);
			const sorted = [...notes].sort((a, b) => a.order_idx - b.order_idx);

			this.setDraft(sorted.map((n) => ({ ...n })));
			this.updateSnapshot();
			this.setReady(sorted.map((n) => ({ ...n })));
		} catch (error) {
			this.setError(error);
		}
	}

	private setDraft(notes: Note[]): void {
		this.draft = notes;
	}

	private scheduleServerUpdate(): void {
		if (!this.userStore.id) return;

		this.clearDebounce();
		this.debounce = setTimeout(() => void this.syncDraftToServer(), 500);
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

	private async syncDraftToServer(): Promise<void> {
		if (!this.userStore.id || !this.hasDraftChanged() || this.focusedId) return;

		try {
			await this.repo.replaceAll(this.userStore.id!, this.draft);
			this.setReady(this.draft.map((n) => ({ ...n })));
			this.updateSnapshot();

			notesChannel.emit('notes_updated');
		} catch (error) {
			this.setError(error);
		}
	}

	constructor(
		private readonly userStore: IBaseUserPort,
		private readonly repo: INotesRepo
	) {
		makeAutoObservable<this, 'userStore' | 'repo' | 'inited' | 'disposers' | 'debounce'>(this, {
			userStore: false,
			repo: false,
			inited: false,
			disposers: false,
			debounce: false,
		});

		this.track(
			reaction(
				() => this.focusedId,
				(focused) => focused === null && this.hasDraftChanged() && this.scheduleServerUpdate()
			)
		);
	}

	init(): void {
		if (this.inited) return;
		this.inited = true;

		this.track(
			reaction(
				() => this.userStore.id,
				(id) => (id ? void this.loadNotes() : this.reset()),
				{ fireImmediately: true }
			)
		);
	}

	destroy(): void {
		this.disposers.forEach((dispose) => {
			try {
				dispose();
			} catch {}
		});
		this.disposers.clear();
		this.clearDebounce();
		this.inited = false;
	}

	private setLoading(): void {
		this.status = 'loading';
		this.error = null;
	}

	private setReady(notes: Note[]): void {
		this.status = 'ready';
		this.error = null;
		this.notes = notes;
	}

	private setError(error: unknown): void {
		this.status = this.notes.length > 0 ? 'ready' : 'error';
		this.error = error instanceof Error ? error.message : String(error);
	}

	private reset(): void {
		this.status = 'idle';
		this.error = null;
		this.notes = [];
		this.draft = [];
		this.clearDebounce();

		if (this.userStore.lastId) storage.remove(key(this.userStore.lastId, 'notes'));
	}

	private clearDebounce(): void {
		if (this.debounce) {
			clearTimeout(this.debounce);
			this.debounce = null;
		}
	}

	private track(disposer?: (() => void) | void): void {
		if (!disposer) return;
		this.disposers.add(disposer);
	}
}
