import { makeAutoObservable } from 'mobx';

import { cityStore } from '@/entities/city';
import { userStore } from '@/entities/user';
import type { UserProfile } from '@/entities/user-profile';
import { userProfileService, userProfileStore } from '@/entities/user-profile';
import { storage } from '@/shared/lib/storage';
import { notifyStore } from '@/shared/stores';

import type { DraftProfile, TabId } from '.';

export class ProfileStore {
	activeTab: TabId = (storage.get('savedTab') as TabId) || 'profile';
	draft: DraftProfile = {
		avatar: '',
		firstName: '',
		lastName: '',
		username: '',
		birthYear: '',
		birthMonth: '',
		birthDay: '',
		gender: null,
		location: '',
		phone: [''],
		email: [''],
		mainEmail: '',
	};

	get avatar() {
		return this.draft.avatar;
	}

	get firstName() {
		return this.draft.firstName;
	}

	get lastName() {
		return this.draft.lastName;
	}

	get username() {
		return this.draft.username;
	}

	get birthYear() {
		return this.draft.birthYear;
	}

	get birthMonth() {
		return this.draft.birthMonth;
	}

	get birthDay() {
		return this.draft.birthDay;
	}

	get gender() {
		return this.draft.gender;
	}

	get location() {
		return this.draft.location;
	}

	get phone() {
		return this.draft.phone;
	}

	get email() {
		return this.draft.email;
	}

	get mainEmail() {
		return this.draft.mainEmail;
	}

	setActiveTab(tab: TabId) {
		this.activeTab = tab;
		storage.set('savedTab', tab);
	}

	updateField<K extends keyof DraftProfile>(key: K, value: DraftProfile[K]) {
		this.draft[key] = value;
	}

	updateArrayField = (key: 'phone' | 'email', index: number, value: string) => {
		const updated = [...this.draft[key]];
		updated[index] = value;
		this.updateField(key, updated);
	};

	addField = (key: 'phone' | 'email') => {
		this.updateField(key, [...this.draft[key], '']);
	};

	removeField = (key: 'phone' | 'email', index: number) => {
		const updated = this.draft[key].filter((_, i) => i !== index);
		this.updateField(key, updated.length ? updated : ['']);
	};

	loadFromProfile() {
		const profile = userProfileStore.profile;
		if (!profile) return;

		this.draft = {
			avatar: profile.avatar_url,
			firstName: profile.first_name,
			lastName: profile.last_name,
			username: userStore.username,
			birthYear: profile.birth_year,
			birthMonth: profile.birth_month,
			birthDay: profile.birth_day,
			gender: profile.gender,
			mainEmail: userStore.email,
			phone: profile.phone.length ? profile.phone : [''],
			email: profile.email.length ? profile.email : [''],
			location: cityStore.cityName || '',
		};
	}

	async saveChanges() {
		try {
			const userProfileData: UserProfile = {
				id: userProfileStore.profile!.id,
				avatar_url: this.avatar || '',
				first_name: this.firstName,
				last_name: this.lastName,
				birth_year: this.birthYear,
				birth_month: this.birthMonth,
				birth_day: this.birthDay,
				gender: this.gender,
				phone: this.phone,
				email: this.email,
			};

			await userProfileService.saveProfile(userProfileData);

			if (userStore.username !== this.username) await userStore.updateUsername(this.username);
			if (userStore.email !== this.mainEmail) await userStore.updateEmail(this.mainEmail);

			notifyStore.setSuccess('Данные успешно сохранены');
		} catch {
			notifyStore.setError('Приозошла ошибка при сохранении данных');
		}
	}

	constructor() {
		makeAutoObservable(this);
	}
}

export const profileStore = new ProfileStore();
