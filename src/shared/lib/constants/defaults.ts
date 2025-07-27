import { City } from '@/entities/city';
import { UserProfile } from '@/entities/user-profile';
import { Note } from '@/widgets/notes/model';

export const DEFAULT_CITY: City = {
	id: '',
	name: 'Москва',
	region: 'Центральный',
	lat: 55.7558,
	lon: 37.6173,
	country: 'Russia',
};

export const DEFAULT_NOTES: Omit<Note, 'id' | 'user_id' | 'created_at' | 'updated_at'>[] = Array.from(
	{ length: 3 },
	(_, i) => ({ text: '', order_idx: i })
);

export const DEFAULT_USER_PROFILE: UserProfile = {
	id: '',
	avatar_url: '',
	first_name: '',
	last_name: '',
	birth_year: '',
	birth_month: '',
	birth_day: '',
	gender: null,
	phone: [''],
	email: [''],
};
