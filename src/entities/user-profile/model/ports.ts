import type { Theme } from '@/features/theme-switcher';

import type { Gender, UserProfile } from '.';

export interface IUserProfileAccountPort {
	readonly isReady: boolean;
	loadProfile(): Promise<void>;
	markPasswordChanged(id: string): Promise<void>;
	deleteAccount(id: string): Promise<void>;
	restoreAccount(id: string): Promise<void>;
}

export interface IUserProfileProfilePort {
	readonly isReady: boolean;
	readonly firstName: string;
	readonly lastName: string;
	readonly birthYear: string;
	readonly birthMonth: string;
	readonly birthDay: string;
	readonly gender: Gender;
	readonly phone: string[];
	readonly email: string[];
	loadProfile(): Promise<void>;
	updateProfile(profile: UserProfile): Promise<void>;
}

export interface IUserProfileThemePort {
	readonly isReady: boolean;
	readonly theme: Theme;
	updateTheme(theme: Theme): Promise<void>;
}

export interface IUserProfileRepo {
	loadProfile(id: string): Promise<UserProfile>;
	updateProfile(id: string, profile: UserProfile): Promise<UserProfile>;
	updateAvatar(id: string, avatar: string): Promise<void>;
	updateTheme(id: string, theme: Theme): Promise<void>;
	updateWidgets(id: string, widgets: string[]): Promise<void>;
	markPasswordChanged(id: string): Promise<string | null>;
	deleteAccount(id: string): Promise<string | null>;
	restoreAccount(id: string): Promise<void>;
}
