import type { Note, NotesSnapshot } from './types';

export interface INotesRepo {
	loadAll(id: string, signal?: AbortSignal): Promise<NotesSnapshot>;
	initialize(id: string, signal?: AbortSignal): Promise<NotesSnapshot>;
	replaceAll(id: string, notes: Note[], revision: number, signal?: AbortSignal): Promise<NotesSnapshot>;
}
