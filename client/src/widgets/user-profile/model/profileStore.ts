import { makeAutoObservable, reaction } from 'mobx';

import type { IUserProfilePort } from '@/entities/user';
import type { Gender, IUserProfileProfilePort, UserProfile } from '@/entities/user-profile';
import type { Status } from '@/shared/stores';

import { getAvailableDays } from '../lib';

type ProfileDraft = {
	firstName: string;
	lastName: string;
	username: string;
	mainEmail: string;
	birthYear: string;
	birthMonth: string;
	birthDay: string;
	gender: Gender;
	phone: string[];
	email: string[];
};

const createDefaultDraft = (): ProfileDraft => ({
	firstName: '',
	lastName: '',
	username: '',
	mainEmail: '',
	birthYear: '',
	birthMonth: '',
	birthDay: '',
	gender: '',
	phone: [''],
	email: [''],
});

export class ProfileStore {
	private disposers = new Set<() => void>();
	private inited: boolean = false;
	private status: Status = 'idle';
	private error: string | null = null;

	days: string[] = [];
	draft: ProfileDraft = createDefaultDraft();

	get isLoading(): boolean {
		return this.status === 'loading';
	}

	get isReady(): boolean {
		return (this.status === 'ready' || this.status === 'loading') && this.userProfileStore.isReady;
	}

	get isError(): boolean {
		return this.status === 'error';
	}

	get errorMessage(): string | null {
		return this.error;
	}

	get firstName(): string {
		return this.draft.firstName;
	}

	get lastName(): string {
		return this.draft.lastName;
	}

	get username(): string {
		return this.draft.username;
	}

	get birthYear(): string {
		return this.draft.birthYear;
	}

	get birthMonth(): string {
		return this.draft.birthMonth;
	}

	get birthDay(): string {
		return this.draft.birthDay;
	}

	get gender(): Gender {
		return this.draft.gender;
	}

	get genderLabel(): string {
		const map: Record<Gender, string> = { male: 'Мужской', female: 'Женский', '': '' };
		return this.gender ? map[this.gender] : 'Не указано';
	}

	get phone(): string[] {
		return this.draft.phone;
	}

	get email(): string[] {
		return this.draft.email;
	}

	get mainEmail(): string {
		return this.draft.mainEmail;
	}

	get isDirty(): boolean {
		const draftComparable = JSON.stringify({
			firstName: this.firstName,
			lastName: this.lastName,
			birthYear: this.birthYear,
			birthMonth: this.birthMonth,
			birthDay: this.birthDay,
			gender: this.gender,
			phone: this.phone,
			email: this.email,
			username: this.username,
			mainEmail: this.mainEmail,
		});

		const truthComparable = JSON.stringify({
			firstName: this.userProfileStore.firstName,
			lastName: this.userProfileStore.lastName,
			birthYear: this.userProfileStore.birthYear,
			birthMonth: this.userProfileStore.birthMonth,
			birthDay: this.userProfileStore.birthDay,
			gender: this.userProfileStore.gender,
			phone: this.userProfileStore.phone,
			email: this.userProfileStore.email,
			username: this.userStore.username,
			mainEmail: this.userStore.email,
		});

		return draftComparable !== truthComparable;
	}

	private get canAddMore(): Record<'phone' | 'email', boolean> {
		return { phone: this.phone.length < 4, email: this.email.length < 3 };
	}

	updateField<K extends keyof ProfileDraft>(key: K, value: ProfileDraft[K]): void {
		this.draft = { ...this.draft, [key]: value };
	}

	updateArrayField(key: 'phone' | 'email', index: number, value: string): void {
		const updated = [...this.draft[key]];
		updated[index] = value;
		this.updateField(key, updated);
	}

	removeField(key: 'phone' | 'email', index: number): void {
		const updated = this.draft[key].filter((_, i) => i !== index);
		this.updateField(key, updated.length ? updated : ['']);
	}

	loadDraft(): void {
		if (!this.userProfileStore.isReady) return;

		this.draft = {
			firstName: this.userProfileStore.firstName,
			lastName: this.userProfileStore.lastName,
			username: this.userStore.username,
			mainEmail: this.userStore.email,
			birthYear: this.userProfileStore.birthYear,
			birthMonth: this.userProfileStore.birthMonth,
			birthDay: this.userProfileStore.birthDay,
			gender: this.userProfileStore.gender,
			phone: [...this.userProfileStore.phone],
			email: [...this.userProfileStore.email],
		};

		this.setReady();
	}

	async saveChanges(): Promise<void> {
		if (!this.userStore.id || this.isLoading || !this.isDirty) return;

		this.setLoading();

		try {
			const birthDate = this.createBirthDate();

			const profile: UserProfile = {
				first_name: this.firstName.trim(),
				last_name: this.lastName.trim(),
				birth_date: birthDate,
				gender: this.gender,
				phones: this.normalizeArray(this.phone),
				additional_emails: this.normalizeArray(this.email),
			};

			await this.userProfileStore.updateProfile(profile);

			if (this.userStore.username !== this.username) await this.userStore.updateUsername(this.username.trim());

			await this.userProfileStore.loadProfile();

			this.loadDraft();
		} catch (error) {
			this.setError(error);
			throw new Error(error instanceof Error ? error.message : 'Произошла ошибка при сохранении');
		}
	}

	private createBirthDate(): string | null {
		if (!this.birthYear || !this.birthMonth || !this.birthDay) return null;

		const month = this.birthMonth.padStart(2, '0');
		const day = this.birthDay.padStart(2, '0');

		return `${this.birthYear}-${month}-${day}`;
	}

	private normalizeArray(values: string[]): string[] {
		return values.map((value) => value.trim()).filter(Boolean);
	}

	private addField(key: 'phone' | 'email'): void {
		if (!this.canAddMore[key]) return;
		this.updateField(key, [...this.draft[key], '']);
	}

	private syncDays(): void {
		this.days = getAvailableDays(this.birthYear, this.birthMonth);
	}

	private syncArrayFields(): void {
		this.syncSingleArrayField('phone');
		this.syncSingleArrayField('email');
	}

	private syncSingleArrayField(field: 'phone' | 'email'): void {
		const values = this.draft[field];
		const nonEmpty = values.filter((value) => value.trim() !== '');

		if (values.length > 1) {
			const cleaned = values.filter((value, index) => value.trim() !== '' || index === values.length - 1);

			if (cleaned.length !== values.length) {
				this.updateField(field, cleaned);
				return;
			}
		}

		if (nonEmpty.length === values.length) this.addField(field);
	}

	constructor(
		private readonly userStore: IUserProfilePort,
		private readonly userProfileStore: IUserProfileProfilePort
	) {
		makeAutoObservable<this, 'userStore' | 'userProfileStore' | 'inited' | 'disposers'>(this, {
			userStore: false,
			userProfileStore: false,
			inited: false,
			disposers: false,
		});

		this.track(
			reaction(
				() => [this.birthYear, this.birthMonth] as const,
				() => this.syncDays(),
				{ fireImmediately: true }
			)
		);

		this.track(
			reaction(
				() => [this.phone.slice(), this.email.slice()] as const,
				() => this.syncArrayFields()
			)
		);

		this.track(
			reaction(
				() => [this.userStore.username, this.userStore.email] as const,
				() => this.loadDraft(),
				{ fireImmediately: true }
			)
		);
	}

	init(): void {
		if (this.inited) return;

		this.inited = true;

		this.track(
			reaction(
				() => this.userStore.id,
				(id) => {
					if (!id) this.reset();
				},
				{ fireImmediately: true }
			)
		);

		this.track(
			reaction(
				() => this.userProfileStore.isReady,
				(isReady) => {
					if (isReady) this.loadDraft();
				},
				{ fireImmediately: true }
			)
		);
	}

	destroy(): void {
		this.disposers.forEach((dispose) => {
			try {
				dispose();
			} catch {}
		});

		this.disposers.clear();
		this.inited = false;
	}

	private setLoading(): void {
		this.status = 'loading';
		this.error = null;
	}

	private setReady(): void {
		this.status = 'ready';
		this.error = null;
	}

	private setError(error: unknown): void {
		this.status = 'error';

		this.error = error instanceof Error ? error.message : String(error);
	}

	private reset(): void {
		this.status = 'idle';
		this.error = null;
		this.days = [];
		this.draft = createDefaultDraft();
	}

	private track(disposer?: (() => void) | void): void {
		if (!disposer) return;
		this.disposers.add(disposer);
	}
}
