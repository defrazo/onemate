import { api } from '@/shared/api';
import { createDefaultNotes } from '@/shared/lib/constants';
import { generateUUID } from '@/shared/lib/utils';

import type { INotesRepo, Note } from '../../model';

type NotesResponse = {
	notes: Note[];
};

export class NotesRepoLaravel implements INotesRepo {
	async loadAll(id: string): Promise<Note[]> {
		const { data } = await api.get<NotesResponse>('/user/notes');

		if (data.notes.length > 0) return data.notes;

		const now = new Date().toISOString();

		const notes: Note[] = createDefaultNotes().map((note, index) => ({
			id: generateUUID(),
			user_id: id,
			text: note.text,
			order_idx: index,
			created_at: now,
			updated_at: now,
		}));

		await this.replaceAll(id, notes);

		return notes;
	}

	async replaceAll(_id: string, notes: Note[]): Promise<void> {
		await api.put('/user/notes', {
			notes: notes.map((note, index) => ({ id: note.id, text: note.text, order_idx: index })),
		});
	}
}
