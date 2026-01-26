import { createDefaultNotes } from '@/shared/lib/constants';
import { supabase } from '@/shared/lib/supabase';

import type { Note } from '.';

const TABLE = 'user_notes';

export const notesService = {
	async loadAll(id: string): Promise<Note[]> {
		const { data, error } = await supabase
			.from(TABLE)
			.select('*')
			.eq('user_id', id)
			.order('order_idx', { ascending: true });

		if (error) throw new Error(`Произошла ошибка при загрузке заметок: ${error.message}`);

		if (!data || data.length === 0) return await notesService.createDefaultNotes(id);

		return data as Note[];
	},

	async createDefaultNotes(id: string): Promise<Note[]> {
		const toInsert = createDefaultNotes().map((note, i) => ({ ...note, user_id: id, order_idx: i }));

		const { data, error } = await supabase.from(TABLE).insert(toInsert).select();
		if (error) throw new Error(`Произошла ошибка при загрузке заметок: ${error.message}`);

		return data as Note[];
	},

	async replaceAll(id: string, notes: Note[]): Promise<void> {
		await supabase.from(TABLE).delete().eq('user_id', id);

		const toInsert: Note[] = notes.map((n, idx) => ({
			...n,
			user_id: id,
			order_idx: idx,
			updated_at: new Date().toISOString(),
		}));

		const { error } = await supabase.from(TABLE).insert(toInsert);
		if (error) throw new Error(`Произошла ошибка при сохранении заметок: ${error.message}`);
	},
};
