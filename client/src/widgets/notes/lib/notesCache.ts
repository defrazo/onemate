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

		if (!cached) {
			return null;
		}

		const data = cached as Partial<NotesCacheData>;

		if (!Array.isArray(data.notes)) {
			return null;
		}

		return {
			notes: data.notes,
			dirty: data.dirty === true,
			updatedAt: data.updatedAt ?? 0,
		};
	},

	write(userId: string, notes: Note[], dirty: boolean): void {
		writeCache(userId, {
			ui: {
				notes: {
					notes,
					dirty,
					updatedAt: Date.now(),
				},
			},
		});
	},
};
