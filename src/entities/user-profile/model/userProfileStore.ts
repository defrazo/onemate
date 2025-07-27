import { makeAutoObservable } from 'mobx';

import { notifyStore } from '@/shared/stores';

import type { UserProfile } from '.';
import { userProfileService } from '.';

export class UserProfileStore {
	profile: UserProfile | null = null;

	get isProfileLoaded() {
		return this.profile !== null;
	}

	setProfile(profile: UserProfile | null) {
		this.profile = profile;
	}

	clearProfile() {
		this.profile = null;
	}

	async loadProfile(): Promise<void> {
		try {
			const profileData = await userProfileService.loadProfile();
			this.setProfile(profileData);
		} catch (error: any) {
			notifyStore.setNotice(error.message || 'Не удалось загрузить профиль', 'error');
		}
	}

	async init() {
		await this.loadProfile();
	}

	constructor() {
		makeAutoObservable(this);
	}
}

export const userProfileStore = new UserProfileStore();
