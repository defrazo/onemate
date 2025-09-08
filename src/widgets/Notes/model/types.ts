export type Note = {
	id: string;
	user_id?: string | null;
	text: string;
	order_idx: number;
	created_at: string;
	updated_at: string;
};
