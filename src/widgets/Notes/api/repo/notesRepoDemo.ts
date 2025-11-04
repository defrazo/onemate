import { createDefaultNotes } from '@/shared/lib/constants';
import { storage } from '@/shared/lib/storage';
import { generateUUID, key } from '@/shared/lib/utils';

import type { INotesRepo, Note } from '../../model';

type DefaultNote = Partial<Pick<Note, 'text' | 'order_idx' | 'id' | 'created_at' | 'updated_at'>>;
type NormalizeOptions = { touchUpdated?: boolean };

export class NotesRepoDemo implements INotesRepo {
	async loadAll(id: string): Promise<Note[]> {
		const stored = storage.get(key(id, 'notes'));

		if (Array.isArray(stored) && stored.length > 0) {
			const normalized = this.sortNotes(this.normalizeNotes(stored));
			storage.set(key(id, 'notes'), normalized);
			return structuredClone(normalized);
		}

		const defaultNotes = this.sortNotes(this.normalizeNotes(createDefaultNotes()));
		storage.set(key(id, 'notes'), defaultNotes);
		return structuredClone(defaultNotes);
	}

	async replaceAll(id: string, notes: Note[]): Promise<void> {
		const normalized = this.sortNotes(this.normalizeNotes(notes, { touchUpdated: true }));
		storage.set(key(id, 'notes'), normalized);
	}

	private normalizeNotes(raw: DefaultNote[] | Note[], opts: NormalizeOptions = {}): Note[] {
		const now = new Date().toISOString();

		return raw.map(({ id, text, order_idx, created_at, updated_at }, idx) => ({
			id: id ?? generateUUID(),
			text: text ?? '',
			order_idx: Number.isFinite(order_idx) ? order_idx! : idx,
			created_at: created_at ?? now,
			updated_at: opts.touchUpdated ? now : (updated_at ?? now),
		}));
	}

	private sortNotes(notes: Note[]): Note[] {
		return [...notes].sort((a, b) => a.order_idx - b.order_idx || a.id.localeCompare(b.id));
	}
}
