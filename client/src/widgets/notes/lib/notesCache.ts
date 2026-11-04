import { COLOR_PALETTE } from '@/shared/config';
import { readCache, writeCache } from '@/shared/lib/cache';

import type { Note } from '../model';

export type NotesCacheData = {
	notes: Note[];
	dirty: boolean;
	updatedAt: number;
};

export const notesCache = {
	read(userId: string): NotesCacheData | null {
		const cached = readCache(userId)?.ui?.notes;
		if (!cached) return null;

		const data = cached as Partial<NotesCacheData>;

		if (!Array.isArray(data.notes)) return null;

		const notes = data.notes.map((note) => ({
			...note,
			color: Object.hasOwn(COLOR_PALETTE, note.color) ? note.color : 'sky',
		})) as Note[];

		return { notes, dirty: data.dirty === true, updatedAt: data.updatedAt ?? 0 };
	},

	write(userId: string, notes: Note[], dirty: boolean) {
		writeCache(userId, { ui: { notes: { notes, dirty, updatedAt: Date.now() } } });
	},
};
