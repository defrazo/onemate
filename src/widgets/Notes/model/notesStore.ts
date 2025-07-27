import { makeAutoObservable, runInAction } from 'mobx';

import { notesChannel } from '@/shared/lib/broadcast';
import { notifyStore } from '@/shared/stores';

import type { Note } from '.';
import { notesService } from '.';

export class NotesStore {
	isLoading = false;
	notes: Note[] = [];
	focusedId: string | null = null;

	get canDeleteMore() {
		return this.notes.length > 1;
	}

	get canAddMore() {
		return this.notes.length < 50;
	}

	setFocusedId(id: string | null) {
		this.focusedId = id;
	}

	async loadNotes() {
		this.isLoading = true;

		try {
			const notes = await notesService.loadNotes();

			runInAction(() => {
				this.notes = notes.sort((a, b) => a.order_idx - b.order_idx);
			});
		} catch (error: any) {
			notifyStore.setNotice(error.message, 'error');
		} finally {
			runInAction(() => {
				this.isLoading = false;
			});
		}
	}

	async addNote() {
		if (!this.canAddMore) {
			notifyStore.setNotice('Максимум 50 заметок', 'error');
			return;
		}

		this.isLoading = true;

		try {
			const maxOrder = this.notes.length ? Math.max(...this.notes.map((n) => n.order_idx)) + 1 : 0;
			const newNote = await notesService.addNote({
				text: '',
				order_idx: maxOrder,
			});

			runInAction(() => {
				this.notes.push(newNote);
			});

			notesChannel.emit('note_added');
		} catch (error: any) {
			notifyStore.setNotice(error.message, 'error');
		} finally {
			runInAction(() => {
				this.isLoading = false;
			});
		}
	}

	async removeNote(id: string) {
		if (!this.canDeleteMore) {
			notifyStore.setNotice('Нельзя удалить все заметки', 'error');
			return;
		}

		this.isLoading = true;

		try {
			await notesService.deleteNote(id);
			await this.loadNotes();

			notesChannel.emit('note_removed');
		} catch (error: any) {
			notifyStore.setNotice(error.message, 'error');
		} finally {
			runInAction(() => {
				this.isLoading = false;
			});
		}
	}

	async updateNote(id: string, key: keyof Note, value: Note[keyof Note]) {
		this.isLoading = true;

		try {
			const note = this.notes.find((n) => n.id === id);
			if (!note) return;

			const updatedNote = { ...note, [key]: value };
			const updated = await notesService.updateNote(updatedNote);

			runInAction(() => {
				const idx = this.notes.findIndex((n) => n.id === updated.id);
				if (idx !== -1) this.notes[idx] = updated;
			});

			notesChannel.emit('notes_updated');
		} catch (error: any) {
			notifyStore.setNotice(error.message, 'error');
		} finally {
			runInAction(() => {
				this.isLoading = false;
			});
		}
	}

	async updateOrder(newNotes: Note[]) {
		this.isLoading = true;

		try {
			await notesService.updateOrder(newNotes);

			runInAction(() => {
				this.notes = [...newNotes];
			});

			notesChannel.emit('notes_reordered');
		} catch (error: any) {
			notifyStore.setNotice(error.message, 'error');
		} finally {
			runInAction(() => {
				this.isLoading = false;
			});
		}
	}

	async init() {
		await this.loadNotes();
	}

	constructor() {
		makeAutoObservable(this);
	}
}

export const notesStore = new NotesStore();
