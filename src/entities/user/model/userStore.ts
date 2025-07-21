import type { User } from '@supabase/supabase-js';
import { makeAutoObservable, runInAction } from 'mobx';

import {
	SESSION_EXPIRATION_MS,
	STORAGE_DELETED,
	STORAGE_DELETED_AT,
	STORAGE_KEY,
	STORAGE_TIMESTAMP_KEY,
} from '@/shared/lib/constants';
import { storage } from '@/shared/lib/storage';
import { supabase } from '@/shared/lib/supabase';

class UserStore {
	user: User | null = null;
	userDeleted: boolean = false;
	deletedAt: string | null = null;
	passwords: [string, string] = ['', ''];
	passwordChangedAt: string | null = null;

	get id() {
		return this.user?.id ?? '';
	}

	get email() {
		return this.user?.email ?? '';
	}

	get username() {
		return this.user?.user_metadata?.username ?? '';
	}

	get isAuthenticated(): boolean {
		return !!this.user;
	}

	get isDeleted(): boolean {
		return this.userDeleted;
	}

	setPasswords(index: number, value: string) {
		this.passwords[index] = value;
	}

	clearPasswords() {
		this.passwords = ['', ''];
	}

	saveSession(user: User) {
		storage.set(STORAGE_KEY, JSON.stringify(user));
		storage.set(STORAGE_TIMESTAMP_KEY, Date.now().toString());
	}

	clearSession() {
		storage.remove(STORAGE_KEY);
		storage.remove(STORAGE_TIMESTAMP_KEY);
		storage.remove(STORAGE_DELETED);
		storage.remove(STORAGE_DELETED_AT);
	}

	saveDeletedAttr(value: boolean, deletedAt?: string | null) {
		this.userDeleted = value;
		this.deletedAt = deletedAt ?? null;

		storage.set(STORAGE_DELETED, value);
		if (deletedAt) storage.set(STORAGE_DELETED_AT, deletedAt);
	}

	clearUser() {
		runInAction(() => {
			this.user = null;
			this.userDeleted = false;
		});
	}

	async updateEmail(email: string) {
		const { data, error } = await supabase.auth.updateUser({ email });
		if (error) throw error;

		runInAction(() => {
			this.user = data.user;
		});
	}

	async updateUsername(username: string) {
		const { data, error } = await supabase.auth.updateUser({ data: { username } });
		if (error) throw error;

		runInAction(() => {
			this.user = data.user;
		});
	}

	async updatePassword(newPassword: string) {
		const { data: session } = await supabase.auth.getSession();
		if (!session.session) throw new Error('Не удалось получить сессию пользователя');

		const { data, error } = await supabase.auth.updateUser({ password: newPassword });
		if (error) throw error;

		await supabase
			.from('user_profiles')
			.update({ password_changed_at: new Date().toISOString() })
			.eq('id', data.user.id);

		runInAction(() => {
			this.user = data.user;
			this.passwordChangedAt = new Date().toISOString();
		});
	}

	async loadSession() {
		const storedUser = storage.get(STORAGE_KEY);
		const storedTime = storage.get(STORAGE_TIMESTAMP_KEY);
		const storedDeleted = storage.get(STORAGE_DELETED);
		const storedDeletedAt = storage.get(STORAGE_DELETED_AT);

		if (storedUser && storedTime) {
			const age = Date.now() - Number(storedTime);

			if (age < SESSION_EXPIRATION_MS) {
				runInAction(() => {
					this.user = storedUser;
					this.userDeleted = !!storedDeleted;
					this.deletedAt = storedDeletedAt;
				});

				return;
			}

			this.clearSession();
		}

		await this.loadUser();
	}

	async loadUser() {
		const { data: sessionData } = await supabase.auth.getSession();

		if (!sessionData.session) {
			this.clearUser();
			this.clearSession();
			return;
		}

		const { data, error } = await supabase.auth.getUser();
		if (error) throw error;

		const { data: profileData, error: profileError } = await supabase
			.from('user_profiles')
			.select('deleted_at, password_changed_at')
			.eq('id', data.user.id)
			.single();

		if (profileError) throw profileError;

		const isDeleted = !!profileData?.deleted_at;
		if (isDeleted) this.saveDeletedAttr(true, profileData.deleted_at);

		runInAction(() => {
			this.user = data.user;
			this.passwordChangedAt = profileData?.password_changed_at ?? null;
			this.saveSession(data.user);
		});
	}

	async checkDeleted() {
		if (!this.user) return;

		const { data: profileData, error } = await supabase
			.from('user_profiles')
			.select('deleted_at')
			.eq('id', this.user.id)
			.single();

		if (error) return;

		runInAction(() => {
			this.userDeleted = !!profileData?.deleted_at;
			storage.set(STORAGE_DELETED, String(this.userDeleted));
			this.deletedAt = profileData?.deleted_at ?? null;
		});
	}

	async init() {
		await this.loadSession();
	}

	constructor() {
		makeAutoObservable(this);

		supabase.auth.onAuthStateChange((_event, session) => {
			runInAction(() => {
				this.user = session?.user ?? null;
				if (this.user) this.saveSession(this.user);
				else this.clearSession();
			});
		});
	}
}

export const userStore = new UserStore();
