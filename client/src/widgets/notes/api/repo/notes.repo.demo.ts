import { COLOR_PALETTE, type PaletteColor } from '@/shared/config';
import { NotesConflictError } from '@/shared/lib/errors';
import { storage } from '@/shared/lib/storage';
import { generateUUID, key } from '@/shared/lib/utils';

import { createDefaultNotes } from '../../model/defaults';
import type { INotesRepo } from '../../model/ports';
import type { Note, NotesSnapshot } from '../../model/types';

export class NotesRepoDemo implements INotesRepo {
	async loadAll(id: string): Promise<NotesSnapshot> {
		return this.read(id);
	}

	private read(id: string): NotesSnapshot {
		const stored = storage.get(key(id, 'notes'));
		const notes = Array.isArray(stored) ? stored : (stored?.notes ?? []);
		return {
			user_id: id,
			revision: Array.isArray(stored) ? 0 : (stored?.revision ?? 0),
			notes: notes
				.map((note: Note) => ({ ...note, color: this.normalizeColor(note.color) }))
				.sort((a: Note, b: Note) => a.order_idx - b.order_idx || a.id.localeCompare(b.id)),
		};
	}

	async initialize(id: string): Promise<NotesSnapshot> {
		return this.locked(id, () => {
			const current = this.read(id);
			if (current.notes.length || current.revision !== 0) return current;
			const now = new Date().toISOString();
			const snapshot = {
				user_id: id,
				revision: 1,
				notes: createDefaultNotes().map((note, index) => ({
					...note,
					id: generateUUID(),
					order_idx: index,
					created_at: now,
					updated_at: now,
				})),
			};
			storage.set(key(id, 'notes'), snapshot);
			return snapshot;
		});
	}

	async replaceAll(id: string, notes: Note[], revision: number): Promise<NotesSnapshot> {
		return this.locked(id, () => {
			const current = this.read(id);
			if (current.revision !== revision) throw new NotesConflictError(current.revision);
			const now = new Date().toISOString();
			const snapshot = {
				user_id: id,
				revision: revision + 1,
				notes: notes.map((note, index) => {
					const previous = current.notes.find((item) => item.id === note.id);
					const changed =
						!previous ||
						previous.text !== note.text ||
						previous.color !== note.color ||
						previous.order_idx !== index;
					return {
						...note,
						order_idx: index,
						created_at: previous?.created_at ?? note.created_at,
						updated_at: changed ? now : previous.updated_at,
					};
				}),
			};
			storage.set(key(id, 'notes'), snapshot);
			return snapshot;
		});
	}

	private locked(id: string, operation: () => NotesSnapshot): Promise<NotesSnapshot> {
		if (typeof navigator !== 'undefined' && navigator.locks)
			return navigator.locks.request(key(id, 'notes'), operation);
		return Promise.resolve(operation());
	}

	private normalizeColor(color: unknown): PaletteColor {
		return typeof color === 'string' && Object.hasOwn(COLOR_PALETTE, color) ? (color as PaletteColor) : 'slate';
	}
}
