import axios from 'axios';

import { api } from '@/shared/api';
import { NotesConflictError } from '@/shared/lib/errors';

import type { INotesRepo } from '../../model/ports';
import type { Note, NotesSnapshot } from '../../model/types';

export class NotesRepoLaravel implements INotesRepo {
	async loadAll(_id: string, signal?: AbortSignal): Promise<NotesSnapshot> {
		const { data } = await api.get<NotesSnapshot>('/user/notes', { signal });
		return data;
	}

	async initialize(id: string, signal?: AbortSignal): Promise<NotesSnapshot> {
		const { data } = await api.post<NotesSnapshot>('/user/notes/initialize', { user_id: id }, { signal });
		return data;
	}

	async replaceAll(id: string, notes: Note[], revision: number, signal?: AbortSignal): Promise<NotesSnapshot> {
		try {
			const { data } = await api.put<NotesSnapshot>(
				'/user/notes',
				{
					user_id: id,
					revision,
					notes: notes.map((note, index) => ({
						id: note.id,
						text: note.text,
						color: note.color,
						order_idx: index,
					})),
				},
				{ signal }
			);
			return data;
		} catch (error) {
			if (
				axios.isAxiosError(error) &&
				error.response?.status === 409 &&
				error.response.data?.code === 'NOTES_REVISION_CONFLICT'
			) {
				throw new NotesConflictError(error.response.data.current_revision);
			}
			throw error;
		}
	}
}
