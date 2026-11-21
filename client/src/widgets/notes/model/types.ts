import type { PaletteColor } from '@/shared/config';

export type Note = {
	id: string;
	user_id?: string | null;
	text: string;
	color: PaletteColor;
	order_idx: number;
	created_at: string;
	updated_at: string;
};

export type NotesSnapshot = {
	user_id: string;
	revision: number;
	notes: Note[];
};
