import { makeAutoObservable } from 'mobx';

import type { UserProfile } from '.';

export class UserProfileStore {
	profile: UserProfile | null = null;
	loading = false;

	get isProfileLoaded() {
		return this.profile !== null;
	}

	setProfile(profile: UserProfile | null) {
		this.profile = profile;
	}

	setLoading(value: boolean) {
		this.loading = value;
	}

	reset() {
		this.profile = null;
		this.loading = false;
	}

	constructor() {
		makeAutoObservable(this);
	}
}

export const userProfileStore = new UserProfileStore();
