import { api } from '@/shared/api';
import type { Theme } from '@/shared/config';

import type { IUserProfileRepo, UserProfile } from '../../model';

type ProfileResponse = {
	profile: UserProfile;
};

type DeleteAccountResponse = {
	code: string;
	deleted_at: string;
};

export class ProfileRepoLaravel implements IUserProfileRepo {
	async loadProfile(_id: string): Promise<UserProfile> {
		const { data } = await api.get<ProfileResponse>('/user/profile');
		return data.profile;
	}

	async updateProfile(_id: string, profile: UserProfile): Promise<UserProfile> {
		const { data } = await api.patch<ProfileResponse>('/user/profile', {
			avatar_url: profile.avatar_url ?? null,
			first_name: profile.first_name,
			last_name: profile.last_name,
			birth_date: profile.birth_date ?? null,
			gender: profile.gender || null,
			location: profile.location ?? null,
			phones: profile.phones ?? null,
			additional_emails: profile.additional_emails ?? null,
			theme: profile.theme ?? 'dark',
			widgets_sequence: profile.widgets_sequence ?? null,
			widgets_slots: profile.widgets_slots ?? null,
		});

		return data.profile;
	}

	async updateAvatar(_id: string, avatar: string): Promise<void> {
		await api.patch('/user/profile/avatar', { avatar_url: avatar });
	}

	async updateTheme(_id: string, theme: Theme): Promise<void> {
		await api.patch('/user/profile/theme', { theme });
	}

	async updateWidgets(_id: string, widgets: string[]): Promise<void> {
		await api.patch('/user/profile/widgets', { widgets_sequence: widgets });
	}

	async updateSlots(_id: string, slots: string[]): Promise<void> {
		await api.patch('/user/profile/widgets', { widgets_slots: slots });
	}

	async markPasswordChanged(_id: string): Promise<string | null> {
		throw new Error('Not implemented');
	}

	async deleteAccount(_id: string): Promise<string | null> {
		const { data } = await api.delete<DeleteAccountResponse>('/user');
		return data.deleted_at;
	}

	async restoreAccount(_id: string): Promise<void> {
		await api.post('/user/restore');
	}
}
