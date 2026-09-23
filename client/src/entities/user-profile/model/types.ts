import type { WidgetId, WidgetSlot } from '@/shared/config';

export type UserProfile = {
	user_id?: string;
	avatar_url?: string | null;
	first_name: string;
	last_name: string;
	birth_date?: string | null;
	gender: Gender;
	phones?: string[] | null;
	additional_emails?: string[] | null;
	theme?: 'light' | 'dark';
	widgets_sequence?: WidgetId[] | null;
	widgets_slots?: WidgetSlot[] | null;
	network_notifications_enabled?: boolean;
	password_changed_at?: string | null;
	deleted_at?: string | null;
	created_at?: string;
	updated_at?: string;
};

export type UserProfilePatch = Partial<UserProfile>;

export type Gender = 'male' | 'female' | '';
