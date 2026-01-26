import type { Note } from '.';

export interface INotesRepo {
	loadAll(id: string): Promise<Note[]>;
	replaceAll(id: string, notes: Note[]): Promise<void>;
}
