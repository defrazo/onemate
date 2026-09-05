import type { Icon } from '@tabler/icons-react';

import type { Gender } from '@/entities/user-profile';

export type TabId = 'overview' | 'personal' | 'contacts' | 'secure';

export type GenderOption = {
	value: Gender;
	label: string;
};

export type ProfileNavButton = {
	id: TabId;
	title: string;
	icon: Icon;
};

export type PersonalDraft = {
	firstName: string;
	lastName: string;
	username: string;
	birthYear: string;
	birthMonth: string;
	birthDay: string;
	gender: Gender;
};
