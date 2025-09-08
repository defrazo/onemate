import type { Gender } from '@/entities/user-profile';

export type TabId = 'overview' | 'personal' | 'contacts' | 'secure';

export type GenderOption = {
	value: Gender;
	label: string;
};

export type ProfileNavButton = {
	id: TabId;
	title: string;
};
