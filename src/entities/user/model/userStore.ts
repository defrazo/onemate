import type { User } from '@supabase/supabase-js';
import { makeAutoObservable, runInAction } from 'mobx';

import { SESSION_EXPIRATION_MS, STORAGE_KEY, STORAGE_TIMESTAMP_KEY } from '@/shared/lib/constants';
import { storage } from '@/shared/lib/storage';
import { supabase } from '@/shared/lib/supabase';

class UserStore {
	user: User | null = null;

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

	saveSession(user: User) {
		storage.set(STORAGE_KEY, JSON.stringify(user));
		storage.set(STORAGE_TIMESTAMP_KEY, Date.now().toString());
	}

	clearSession() {
		storage.remove(STORAGE_KEY);
		storage.remove(STORAGE_TIMESTAMP_KEY);
	}

	clearUser() {
		runInAction(() => {
			this.user = null;
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

	async loadSession() {
		const storedUser = storage.get(STORAGE_KEY);
		const storedTime = storage.get(STORAGE_TIMESTAMP_KEY);

		if (storedUser && storedTime) {
			const age = Date.now() - Number(storedTime);

			if (age < SESSION_EXPIRATION_MS) {
				runInAction(() => {
					this.user = storedUser;
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
			runInAction(() => {
				this.user = null;
			});
			this.clearSession();
			return;
		}

		const { data, error } = await supabase.auth.getUser();
		if (error) throw error;

		runInAction(() => {
			this.user = data.user;
			this.saveSession(data.user);
		});
	}

	constructor() {
		makeAutoObservable(this);
		this.loadSession();

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
