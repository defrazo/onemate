import { userStore } from '@/entities/user';
import { DEFAULT_NOTES } from '@/shared/lib/constants';
import { supabase } from '@/shared/lib/supabase';

import type { NewNote, Note } from '.';

const TABLE = 'user_notes';

export const notesService = {
	async loadNotes(): Promise<Note[]> {
		const userId = userStore.getIdOrThrow();

		const { data, error } = await supabase
			.from(TABLE)
			.select('*')
			.eq('user_id', userId)
			.order('order_idx', { ascending: true });

		if (error) throw new Error(`Ошибка загрузки заметок: ${error.message}`);

		if (!data || data.length === 0) {
			const inserted = await this.createDefaultNotes(userId);
			return inserted;
		}

		return data;
	},

	async createDefaultNotes(userId: string): Promise<Note[]> {
		const toInsert = DEFAULT_NOTES.map((note, i) => ({ ...note, user_id: userId, order_idx: i }));

		const { data, error } = await supabase.from(TABLE).insert(toInsert).select();
		if (error) throw new Error(`Ошибка создания заметок по умолчанию: ${error.message}`);

		return data;
	},

	async addNote(note: NewNote): Promise<Note> {
		const userId = userStore.getIdOrThrow();

		const noteWithUser = { ...note, user_id: userId };

		const { count } = await supabase.from(TABLE).select('id', { count: 'exact', head: true }).eq('user_id', userId);
		if ((count ?? 0) >= 50) throw new Error('Максимум 50 заметок');

		const { data: inserted, error } = await supabase.from(TABLE).insert([noteWithUser]).select().single();
		if (error) throw new Error(`Ошибка сохранения заметки: ${error.message}`);

		return inserted;
	},

	async deleteNote(id: string): Promise<void> {
		const userId = userStore.getIdOrThrow();

		const { count } = await supabase.from(TABLE).select('id', { count: 'exact', head: true }).eq('user_id', userId);
		if ((count ?? 0) <= 1) throw new Error('Нельзя удалить все заметки');

		const { error } = await supabase.from(TABLE).delete().eq('id', id).eq('user_id', userId);
		if (error) throw new Error(`Ошибка удаления заметки: ${error.message}`);
	},

	async updateNote(note: Pick<Note, 'id'> & Partial<Omit<Note, 'id' | 'user_id'>>): Promise<Note> {
		const userId = userStore.getIdOrThrow();

		const { data, error } = await supabase
			.from(TABLE)
			.update({ ...note, updated_at: new Date().toISOString() })
			.eq('id', note.id)
			.eq('user_id', userId)
			.select()
			.single();

		if (error) throw new Error(`Ошибка обновления заметки: ${error.message}`);

		return data;
	},

	async updateOrder(ordered: Note[]): Promise<void> {
		const userId = userStore.getIdOrThrow();

		const updates = ordered
			.map((note, index) => ({
				id: note.id,
				user_id: userId,
				order_idx: index,
				updated_at: new Date().toISOString(),
			}))
			.filter((note, index) => note.order_idx !== ordered[index].order_idx);

		if (updates.length === 0) return;

		const { error } = await supabase.from(TABLE).upsert(updates, { onConflict: 'id' });
		if (error) throw new Error(`Ошибка обновления порядка: ${error.message}`);
	},
};
