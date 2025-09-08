import type { Theme } from '@/features/theme-switcher';

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
	theme?: Theme;
	widgets_sequence?: string[];
	mainEmail?: string;
	deleted_at?: string | null;
	password_changed_at?: string | null;
};
