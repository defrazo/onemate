export type TabId = 'profile' | 'info' | 'contacts' | 'secure';

export type ProfileNavButton = {
	id: TabId;
	title: string;
};

export type DraftProfile = {
	avatar?: string;
	firstName: string;
	lastName: string;
	username: string;
	year: string;
	month: string;
	day: string;
	gender: 'male' | 'female' | null;
	mainEmail: string;
	phone: string[];
	email: string[];
};

export type GenderOption = {
	value: 'male' | 'female' | null;
	label: string;
};

export type BrowserInfo = {
	browser: string;
	isPhone: boolean;
};
