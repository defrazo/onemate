import { makeAutoObservable } from 'mobx';

import { storage } from '@/shared/lib/storage/localStorage';

import type { UserProfile } from '.';

class UserProfileStore {
	profile: UserProfile | null = storage.get('userProfile') || null;

	// get avatar() {
	// 	return this.profile?.avatarUrl;
	// }

	get userId() {
		return this.profile?.userId;
	}

	get firstName() {
		return this.profile?.firstName;
	}

	get lastName() {
		return this.profile?.lastName;
	}

	get gender() {
		return this.profile?.gender === 'male' ? 'Мужской' : 'Женский';
	}

	get birthYear() {
		return this.profile?.birthDate.year;
	}

	get birthMonth() {
		return this.profile?.birthDate.month;
	}

	get birthDay() {
		return this.profile?.birthDate.day;
	}

	get location() {
		return this.profile?.location;
	}

	get phone() {
		return this.profile?.phone || [];
	}

	get email() {
		return this.profile?.email || [];
	}

	setProfile(profile: UserProfile | null) {
		this.profile = profile;
		this.syncProfile(profile);
	}

	updateAvatar(url: string) {
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

	updateLocation(city: string) {
		if (this.profile) {
			this.profile.location = city;
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

	constructor() {
		makeAutoObservable(this);
	}
}

export const userProfileStore = new UserProfileStore();
