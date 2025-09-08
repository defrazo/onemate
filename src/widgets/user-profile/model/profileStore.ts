import { makeAutoObservable, reaction } from 'mobx';

import type { IUserProfilePort } from '@/entities/user';
import type { Gender, IUserProfileProfilePort, UserProfile } from '@/entities/user-profile';
import { createDefaultProfile } from '@/shared/lib/constants';
import type { Status } from '@/shared/stores';

import { getAvailableDays } from '../lib';

export class ProfileStore {
	private disposers = new Set<() => void>();
	private inited: boolean = false;
	private status: Status = 'idle';
	private error: string | null = null;

	days: string[] = [];
	draft: UserProfile = createDefaultProfile();

	get isLoading(): boolean {
		return this.status === 'loading';
	}

	get isReady(): boolean {
		return (
			(this.status === 'ready' || this.status === 'loading') &&
			this.draft !== null &&
			this.userProfileStore.isReady
		);
	}

	get isError(): boolean {
		return this.status === 'error';
	}

	get errorMessage(): string | null {
		return this.error;
	}

	get firstName(): string {
		return this.draft.first_name;
	}

	get lastName(): string {
		return this.draft.last_name;
	}

	get username(): string {
		return this.draft.username ?? '';
	}

	get birthYear(): string {
		return this.draft.birth_year;
	}

	get birthMonth(): string {
		return this.draft.birth_month;
	}

	get birthDay(): string {
		return this.draft.birth_day;
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
		return this.draft.mainEmail ?? '';
	}

	get isDirty(): boolean {
		const draftComparable = JSON.stringify({
			first_name: this.draft.first_name,
			last_name: this.draft.last_name,
			birth_year: this.draft.birth_year,
			birth_month: this.draft.birth_month,
			birth_day: this.draft.birth_day,
			gender: this.draft.gender,
			phone: this.draft.phone,
			email: this.draft.email,
			username: this.draft.username,
			mainEmail: this.draft.mainEmail,
		});

		const truthComparable = JSON.stringify({
			first_name: this.userProfileStore.firstName,
			last_name: this.userProfileStore.lastName,
			birth_year: this.userProfileStore.birthYear,
			birth_month: this.userProfileStore.birthMonth,
			birth_day: this.userProfileStore.birthDay,
			gender: this.userProfileStore.gender,
			phone: this.userProfileStore.phone,
			email: this.userProfileStore.email,
			username: this.userStore.username,
			mainEmail: this.userStore.email,
		});

		return draftComparable !== truthComparable;
	}

	private get canAddMore(): Record<'phone' | 'email', boolean> {
		return {
			phone: this.draft.phone.length < 4,
			email: this.draft.email.length < 3,
		};
	}

	updateField<K extends keyof UserProfile>(key: K, value: UserProfile[K]): void {
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

	async saveChanges(): Promise<void> {
		if (!this.draft || !this.userStore.id || this.isLoading) return;

		this.setLoading();

		try {
			const { username, mainEmail, ...profile } = this.draft;

			await this.userProfileStore.updateProfile(profile);
			if (this.userStore.username !== username) await this.userStore.updateUsername(this.username);
			if (this.userStore.email !== mainEmail) await this.userStore.updateEmail(this.mainEmail);
		} catch (error: any) {
			this.setError(error);
			throw new Error(error.message || 'Произошла ошибка при сохранении');
		} finally {
			await this.userProfileStore.loadProfile();
			this.loadDraft();
		}
	}

	private loadDraft(): void {
		this.draft = {
			first_name: this.userProfileStore.firstName,
			last_name: this.userProfileStore.lastName,
			username: this.userStore.username,
			birth_year: this.userProfileStore.birthYear,
			birth_month: this.userProfileStore.birthMonth,
			birth_day: this.userProfileStore.birthDay,
			gender: this.userProfileStore.gender,
			phone: this.userProfileStore.phone,
			email: this.userProfileStore.email,
			mainEmail: this.userStore.email,
		};

		this.setReady();
	}

	private addField(key: 'phone' | 'email'): void {
		if (this.canAddMore[key]) this.updateField(key, [...this.draft[key], '']);
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
				() => [this.birthYear, this.birthMonth],
				() => this.syncDays(),
				{ fireImmediately: true }
			)
		);

		this.track(
			reaction(
				() => [this.phone.slice(), this.email.slice()],
				() => this.syncArrayFields()
			)
		);

		this.track(
			reaction(
				() => [this.userStore.username, this.userStore.email],
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
				(id) => !id && this.reset(),
				{ fireImmediately: true }
			)
		);

		this.track(
			reaction(
				() => this.userProfileStore.isReady,
				(isReady) => isReady && this.loadDraft(),
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
		this.draft = createDefaultProfile();
	}

	private track(disposer?: (() => void) | void): void {
		if (!disposer) return;
		this.disposers.add(disposer);
	}
}
