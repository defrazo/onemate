import { makeAutoObservable } from 'mobx';

import { AVATAR_OPTIONS } from '@/shared/lib/constants';
import { storage } from '@/shared/lib/storage/localStorage';

import type { UserProfile } from '.';

class UserProfileStore {
	profile: UserProfile | null = storage.get('userProfile') || null;

	get userId() {
		return this.profile?.userId;
	}

	get avatar() {
		return this.profile?.avatarUrl || AVATAR_OPTIONS[0];
	}

	get firstName() {
		return this.profile?.firstName || '';
	}

	get lastName() {
		return this.profile?.lastName || '';
	}

	get birthYear() {
		return this.profile?.birthDate.year || '';
	}

	get birthMonth() {
		return this.profile?.birthDate.month || '';
	}

	get birthDay() {
		return this.profile?.birthDate.day || '';
	}

	get gender() {
		return this.profile?.gender ? (this.profile.gender === 'male' ? 'male' : 'female') : null;
	}

	get location() {
		return this.profile?.location;
	}

	get phone() {
		return this.profile?.phone?.length ? this.profile.phone : [''];
	}

	get email() {
		return this.profile?.email?.length ? this.profile.email : [''];
	}

	updateField<K extends keyof UserProfile>(key: K, value: UserProfile[K]) {
		if (this.profile) {
			this.profile[key] = value;
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

	setProfile(profile: UserProfile | null) {
		this.profile = profile;
		this.syncProfile(profile);
	}

	clearProfile() {
		this.profile = null;
	}

	private syncProfile(profile: UserProfile | null) {
		storage.set('userProfile', profile);
	}

	private syncToUserProfiles(profile: UserProfile) {
		const profiles: UserProfile[] = storage.get('userProfiles') || [];
		const index = profiles.findIndex((p) => p.userId === profile.userId);

		if (index !== -1) profiles[index] = profile;
		else profiles.push(profile);

		storage.set('userProfiles', profiles);
	}

	constructor() {
		makeAutoObservable(this);
	}
}

export const userProfileStore = new UserProfileStore();
