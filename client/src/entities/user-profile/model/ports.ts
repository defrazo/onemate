import type { Theme } from '@/shared/config';

import type { Gender, UserProfile, UserProfilePatch } from '.';

export interface IBaseUserProfilePort {
	readonly isReady: boolean;
}

export interface IUserProfileProfilePort extends IBaseUserProfilePort {
	readonly firstName: string;
	readonly lastName: string;
	readonly birthYear: string;
	readonly birthMonth: string;
	readonly birthDay: string;
	readonly gender: Gender;
	readonly phones: string[];
	readonly emails: string[];

	updateProfile(profile: UserProfile): Promise<void>;
}

export interface IUserProfileThemePort extends IBaseUserProfilePort {
	readonly theme: Theme;

	updateTheme(theme: Theme): Promise<void>;
}

export interface IUserProfileRepo {
	loadProfile(id: string): Promise<UserProfile>;
	updateProfile(id: string, patch: UserProfilePatch): Promise<UserProfile>;
	updateAvatar(id: string, avatar: string): Promise<void>;
	updateTheme(id: string, theme: Theme): Promise<void>;
	updateWidgets(id: string, widgets: string[]): Promise<void>;
	updateSlots(id: string, slots: string[]): Promise<void>;
	markPasswordChanged(id: string): Promise<string | null>;
}
