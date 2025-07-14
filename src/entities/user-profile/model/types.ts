export interface UserProfile {
	id?: string;
	avatar_url: string;
	first_name: string;
	last_name: string;
	birth_year: string;
	birth_month: string;
	birth_day: string;
	gender: 'male' | 'female' | null;
	phone: string[];
	email: string[];
}
