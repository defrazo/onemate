import type { Theme } from '@/shared/config';

import type { UserProfile, UserProfilePatch } from '.';

export interface IUserProfileThemePort {
	readonly isReady: boolean;
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
