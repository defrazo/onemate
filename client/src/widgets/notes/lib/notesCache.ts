import { COLOR_PALETTE, LS_PREFIX } from '@/shared/config';
import { readCache, writeCache } from '@/shared/lib/cache';
import { storage } from '@/shared/lib/storage';

import type { Note } from '../model/types';

export type NotesDraftData = {
	notes: Note[];
	revision: number | null;
	version: number;
	writer: string | null;
	updatedAt: number;
	conflict?: boolean;
};

const prefix = (userId: string) => `${LS_PREFIX}notes_draft_${userId}_`;
const draftKey = (userId: string, writer: string) => `${prefix(userId)}${writer}`;

const validateNotes = (value: unknown): Note[] | null => {
	if (!Array.isArray(value) || value.length > 50) return null;

	const ids = new Set<string>();
	const notes: Note[] = [];

	for (const note of value) {
		if (!note || typeof note.id !== 'string' || ids.has(note.id) || typeof note.text !== 'string') return null;

		ids.add(note.id);

		notes.push({
			...note,
			color: Object.hasOwn(COLOR_PALETTE, note.color) ? note.color : 'sky',
			order_idx: Number.isInteger(note.order_idx) && note.order_idx >= 0 ? note.order_idx : notes.length,
		});
	}
	return notes;
};

export const notesCache = {
	readAll(userId: string): NotesDraftData[] {
		const result: NotesDraftData[] = [];

		for (const key of Object.keys(localStorage)) {
			if (!key.startsWith(prefix(userId))) continue;

			const data = storage.get(key);
			const notes = validateNotes(data?.notes);

			if (!notes || typeof data.writer !== 'string' || key !== draftKey(userId, data.writer)) continue;

			result.push({
				...data,
				notes,
				revision: Number.isSafeInteger(data.revision) && data.revision >= 0 ? data.revision : null,
			});
		}

		const legacy = readCache(userId)?.ui?.notes as
			{ notes?: unknown; dirty?: boolean; updatedAt?: number } | undefined;

		const legacyNotes = validateNotes(legacy?.notes);

		if (legacy?.dirty && legacyNotes)
			result.push({
				notes: legacyNotes,
				revision: null,
				version: 0,
				writer: null,
				updatedAt: legacy.updatedAt ?? 0,
				conflict: true,
			});

		return result.sort((a, b) => b.updatedAt - a.updatedAt);
	},

	read(userId: string, writer: string): NotesDraftData | null {
		const drafts = this.readAll(userId);
		return drafts.find((draft) => draft.writer === writer) ?? drafts[0] ?? null;
	},

	write(userId: string, writer: string, draft: Omit<NotesDraftData, 'writer' | 'updatedAt'>): void {
		storage.set(draftKey(userId, writer), { ...draft, writer, updatedAt: Date.now() });
	},

	acknowledge(userId: string, writer: string, version: number): void {
		const key = draftKey(userId, writer);
		if (storage.get(key)?.version === version) storage.remove(key);
	},

	discardOwn(userId: string, writer: string): void {
		storage.remove(draftKey(userId, writer));
	},

	discardLegacy(userId: string): void {
		writeCache(userId, { ui: { notes: undefined } });
	},

	discardAll(userId: string): void {
		for (const key of Object.keys(localStorage)) if (key.startsWith(prefix(userId))) storage.remove(key);
		writeCache(userId, { ui: { notes: undefined } });
	},
};
