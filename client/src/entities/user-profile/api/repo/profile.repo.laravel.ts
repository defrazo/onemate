import { api } from '@/shared/api';
import type { Theme, WidgetId, WidgetSlot } from '@/shared/config';

import type { IUserProfileRepo, UserProfile, UserProfilePatch } from '../../model';

type ProfileResponse = {
	profile: UserProfile;
};

export class ProfileRepoLaravel implements IUserProfileRepo {
	async loadProfile(_id: string): Promise<UserProfile> {
		const { data } = await api.get<ProfileResponse>('/user/profile');
		return data.profile;
	}

	async updateProfile(_id: string, patch: UserProfilePatch): Promise<UserProfile> {
		const { data } = await api.patch<ProfileResponse>('/user/profile', patch);
		return data.profile;
	}

	async updateAvatar(_id: string, avatar: string): Promise<void> {
		await api.patch('/user/profile/avatar', { avatar_url: avatar });
	}

	async updateTheme(_id: string, theme: Theme): Promise<void> {
		await api.patch('/user/profile/theme', { theme });
	}

	async updateNotification(_id: string, patch: UserProfilePatch): Promise<UserProfile> {
		const { data } = await api.patch<ProfileResponse>('/user/profile', patch);
		return data.profile;
	}

	async updateWidgets(_id: string, widgets: WidgetId[]): Promise<void> {
		await api.patch('/user/profile/widgets', { widgets_sequence: widgets });
	}

	async updateSlots(_id: string, slots: WidgetSlot[]): Promise<void> {
		await api.patch('/user/profile/widgets', { widgets_slots: slots });
	}
}
