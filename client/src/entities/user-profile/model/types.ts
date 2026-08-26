export type Gender = 'male' | 'female' | '';

export type UserProfile = {
	user_id?: string;
	avatar_url?: string | null;
	first_name: string;
	last_name: string;
	birth_date?: string | null;
	gender: Gender;
	location?: string | null;
	phones?: string[] | null;
	additional_emails?: string[] | null;
	theme?: 'light' | 'dark';
	widgets_sequence?: string[] | null;
	widgets_slots?: string[] | null;
	password_changed_at?: string | null;
	deleted_at?: string | null;
	created_at?: string;
	updated_at?: string;
};
