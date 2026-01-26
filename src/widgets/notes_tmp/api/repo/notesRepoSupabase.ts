import type { INotesRepo, Note } from '../../model';
import { notesService } from '../../model';

export class NotesRepoSupabase implements INotesRepo {
	async loadAll(id: string): Promise<Note[]> {
		return notesService.loadAll(id);
	}

	async replaceAll(id: string, notes: Note[]): Promise<void> {
		return notesService.replaceAll(id, notes);
	}
}
