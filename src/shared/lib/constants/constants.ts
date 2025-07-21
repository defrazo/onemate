import { City } from '@/entities/city';
import { UserProfile } from '@/entities/user-profile';

// --- userProfile ---
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

// --- calendar ---
export const WEEKDAYS_RU_SHORT = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

// --- userStore ---
export const STORAGE_KEY = 'app_user';
export const STORAGE_TIMESTAMP_KEY = 'app_user_timestamp';
export const STORAGE_DELETED = 'app_user_deleted';
export const STORAGE_DELETED_AT = 'app_user_deleted_at';
export const SESSION_EXPIRATION_MS = 3600_000; // 1 час

// --- cityStore ---
export const DEFAULT_CITY: City = {
	id: '',
	name: 'Москва',
	region: 'Центральный',
	lat: 55.7558,
	lon: 37.6173,
	country: 'Russia',
};
export const LAST_CITY_KEY = 'app_user_city';
