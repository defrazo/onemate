import type { Theme } from '@/features/theme-switcher';

import type { IUserProfileRepo, UserProfile } from '../../model';
import { userProfileService } from '../../model';

export class ProfileRepoSupabase implements IUserProfileRepo {
	async loadProfile(id: string): Promise<UserProfile> {
		return userProfileService.loadProfile(id);
	}

	async updateProfile(id: string, profile: UserProfile): Promise<UserProfile> {
		return userProfileService.updateProfile(id, profile);
	}

	async updateAvatar(id: string, avatar: string): Promise<void> {
		return userProfileService.updateAvatar(id, avatar);
	}

	async updateTheme(id: string, theme: Theme): Promise<void> {
		return userProfileService.updateTheme(id, theme);
	}

	async updateWidgets(id: string, widgets: string[]): Promise<void> {
		return userProfileService.updateWidgets(id, widgets);
	}

	async markPasswordChanged(id: string): Promise<string | null> {
		return userProfileService.markPasswordChanged(id);
	}

	async deleteAccount(id: string): Promise<string | null> {
		return userProfileService.deleteAccount(id);
	}

	async restoreAccount(id: string): Promise<void> {
		return userProfileService.restoreAccount(id);
	}
}
