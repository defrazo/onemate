export type Patch = Partial<Cache>;

export type Cache = {
	ts: number;
	ui?: { widgets_sequence?: string[]; widgets_slots?: string[]; avatar_url?: string };
	auth?: { user_id?: string; deleted_at?: string };
};
