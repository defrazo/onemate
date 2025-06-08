import { makeAutoObservable } from 'mobx';

import { storage } from '@/shared/lib/storage/localStorage';

import type { UserProfile } from '.';

class UserProfileStore {
	profile: UserProfile | null = storage.get('userProfile') || null;

	constructor() {
		makeAutoObservable(this);
	}

	setProfile(profile: UserProfile | null) {
		this.profile = profile;
		this.syncProfile(profile);
	}

	updateAvatarUrl(url: string) {
		if (this.profile) {
			this.profile.avatarUrl = url;
			this.syncProfile(this.profile);
			this.syncToUserProfiles(this.profile);
		}
	}

	updateFirstName(firstName: string) {
		if (this.profile) {
			this.profile.firstName = firstName;
			this.syncProfile(this.profile);
			this.syncToUserProfiles(this.profile);
		}
	}

	updateLastName(lastName: string) {
		if (this.profile) {
			this.profile.lastName = lastName;
			this.syncProfile(this.profile);
			this.syncToUserProfiles(this.profile);
		}
	}

	updateGender(gender: 'male' | 'female' | null) {
		if (this.profile) {
			this.profile.gender = gender;
			this.syncProfile(this.profile);
			this.syncToUserProfiles(this.profile);
		}
	}

	updateBirthDate({ year, month, day }: { year: string; month: string; day: string }) {
		if (this.profile) {
			this.profile.birthDate = { year, month, day };
			this.syncProfile(this.profile);
			this.syncToUserProfiles(this.profile);
		}
	}

	updatePhone(phone: string[]) {
		if (this.profile) {
			this.profile.phone = phone;
			this.syncProfile(this.profile);
			this.syncToUserProfiles(this.profile);
		}
	}

	updateEmail(email: string[]) {
		if (this.profile) {
			this.profile.email = email;
			this.syncProfile(this.profile);
			this.syncToUserProfiles(this.profile);
		}
	}

	clearProfile() {
		this.profile = null;
	}

	// Синхронизация с localStorage
	private syncProfile(profile: UserProfile | null) {
		storage.set('userProfile', profile);
	}

	private syncToUserProfiles(profile: UserProfile) {
		const profiles: UserProfile[] = storage.get('userProfiles') || [];

		const index = profiles.findIndex((p) => p.userId === profile.userId);

		if (index !== -1) {
			profiles[index] = profile;
		} else {
			profiles.push(profile);
		}

		storage.set('userProfiles', profiles);
	}
}

export const userProfileStore = new UserProfileStore();
