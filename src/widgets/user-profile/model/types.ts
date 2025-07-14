export type TabId = 'profile' | 'info' | 'contacts' | 'secure';

export type ProfileNavButton = {
	id: TabId;
	title: string;
};

export type DraftProfile = {
	avatar: string;
	firstName: string;
	lastName: string;
	username: string;
	birthYear: string;
	birthMonth: string;
	birthDay: string;
	gender: 'male' | 'female' | null;
	location: string;
	phone: string[];
	email: string[];
	mainEmail: string;
};

export type GenderOption = {
	value: 'male' | 'female' | null;
	label: string;
};

export type BrowserInfo = {
	browser: string;
	isPhone: boolean;
};
