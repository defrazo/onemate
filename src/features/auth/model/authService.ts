import { checkUser, type User, userStore } from '@/entities/user';
import { userProfileStore } from '@/entities/userProfile';
import { storage } from '@/shared/lib/storage/localStorage';

import { setUserSession, validateEmail, validatePasswords, validateUsername } from '../lib';
import type { AuthData } from '.';

export const authService = {
	async oAuth(data: any): Promise<boolean> {
		const user = data?.user ?? data?.data?.user;

		if (!user) throw new Error('Пользователь не найден');

		const email = user.email;
		const username = user.user_metadata?.full_name ?? 'Пользователь';

		try {
			const user = checkUser(username, email);
			setUserSession(user);

			return true;
		} catch (error) {
			throw error;
		}
	},

	async register(data: AuthData): Promise<boolean> {
		const { username, email, password, passwordConfirm } = data;

		try {
			await validateUsername(username);
			await validateEmail(email);
			await validatePasswords(password, passwordConfirm);

			const user = checkUser(username, email, password);
			setUserSession(user);

			return true;
		} catch (error) {
			throw error;
		}
	},

	async login(data: AuthData): Promise<boolean> {
		const { username, email, password } = data;

		try {
			const existingUsers: User[] = storage.get('users') || [];
			const user = existingUsers.find(
				(u) => (u.username === username || u.email === email) && u.password === password
			);

			if (!user) throw new Error('Неверное имя пользователя или пароль.');

			setUserSession(user);

			return true;
		} catch (error) {
			throw error;
		}
	},

	logout() {
		userStore.setUser(null);
		userProfileStore.clearProfile?.();

		storage.remove('user');
		storage.remove('isAuth');
	},

	checkAuth(): boolean {
		const isAuth = storage.get('isAuth');
		const savedUser = storage.get('user');
		const savedProfile = storage.get('userProfile');

		if (isAuth && savedUser && savedProfile) {
			userStore.setUser(savedUser);
			userProfileStore.setProfile(savedProfile);

			return true;
		}

		userStore.setUser(null);
		userProfileStore.clearProfile?.();

		return false;
	},
};
