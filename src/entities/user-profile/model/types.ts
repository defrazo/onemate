export type Gender = 'male' | 'female' | '';

export type UserProfile = {
	id?: string;
	avatar_url?: string;
	first_name: string;
	last_name: string;
	username?: string;
	birth_year: string;
	birth_month: string;
	birth_day: string;
	gender: Gender;
	phone: string[];
	email: string[];
	theme?: 'light' | 'dark';
	widgets_sequence?: string[];
	widgets_slots?: string[];
	mainEmail?: string;
	deleted_at?: string | null;
	password_changed_at?: string | null;
};
