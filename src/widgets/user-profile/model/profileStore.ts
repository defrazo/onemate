import { makeAutoObservable, reaction } from 'mobx';

import { cityStore } from '@/entities/city';
import { userStore } from '@/entities/user';
import type { UserProfile } from '@/entities/user-profile';
import { userProfileService, userProfileStore } from '@/entities/user-profile';
import { notifyStore } from '@/shared/stores';

import { getAvailableDays } from '../lib';
import type { DraftProfile } from '.';

export class ProfileStore {
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

	isProfileUploaded: boolean = false;
	days: string[] = [];

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

	get genderLabel() {
		const map: Record<string, string> = { male: 'Мужской', female: 'Женский' };
		return map[this.draft.gender ?? ''] || 'Не указано';
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

	syncArrayFields(): void {
		this.syncSingleArrayField('phone');
		this.syncSingleArrayField('email');
	}

	syncDays(): void {
		this.days = getAvailableDays(this.birthYear, this.birthMonth);
	}

	loadFromProfile(): void {
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

		this.isProfileUploaded = true;
	}

	init() {
		this.loadFromProfile();
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

	private syncSingleArrayField(field: 'phone' | 'email') {
		const values = this[field];
		const nonEmpty = values.filter((val) => val.trim() !== '');

		if (values.length > 1) {
			const cleaned = values.filter((val, i) => val.trim() !== '' || i === values.length - 1);
			if (cleaned.length !== values.length) {
				this.updateField(field, cleaned);
				return;
			}
		}

		if (nonEmpty.length === values.length) this.addField(field);
	}

	constructor() {
		makeAutoObservable(this);

		reaction(
			() => [this.birthYear, this.birthMonth],
			() => this.syncDays()
		);

		reaction(
			() => [this.phone.slice(), this.email.slice()],
			() => this.syncArrayFields()
		);
	}
}

export const profileStore = new ProfileStore();
