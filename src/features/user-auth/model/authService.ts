import { userStore } from '@/entities/user';
import { userProfileStore } from '@/entities/user-profile';
import { storage } from '@/shared/lib/storage';
import { supabase } from '@/shared/lib/supabase';

import { validateEmail, validatePasswords, validateUsername } from '../lib';
import type { AuthData, SupabaseUserCheck } from '.';
import { authFormStore, setUserSession } from '.';

const defaultRedirect = 'http://92.248.239.2:3000/auth/callback';

export const authService = {
	async oAuth(data: any): Promise<boolean> {
		const user = data?.user ?? data?.data?.user;
		if (!user) throw new Error('Пользователь не найден');

		const username = user.user_metadata?.full_name ?? 'Пользователь';

		await setUserSession({
			id: user.id,
			email: user.email!,
			username,
		});

		return true;
	},

	async register(data: AuthData): Promise<boolean> {
		const { username, email, password, passwordConfirm } = data;

		await validateUsername(username);
		await validateEmail(email);
		await validatePasswords(password, passwordConfirm);

		// Проверка существования аккаунта (через RPC)
		const existing = await authService.checkUserByEmail(email);

		if (existing) {
			if (!existing.email_confirmed_at) {
				authFormStore.switchToConfirm(email);
				await authService.handleResend(email);
				throw new Error('Аккаунт уже зарегистрирован, подтвердите e-mail');
			} else throw new Error('Пользователь с таким e-mail уже существует');
		}

		// Регистрация
		const { data: userData, error } = await supabase.auth.signUp({
			email,
			password,
			options: {
				data: { full_name: username },
				emailRedirectTo: defaultRedirect,
			},
		});

		if (error || !userData?.user) throw new Error(error?.message || 'Ошибка регистрации');

		// Проверка подтверждения
		if (!userData.user.email_confirmed_at) {
			authFormStore.switchToConfirm(email);
			return false;
		}

		await setUserSession({
			id: userData.user.id,
			email: userData.user.email!,
			username,
		});

		return true;
	},

	async login(login: string, password: string): Promise<boolean> {
		// Поиск email для username (через RPC)
		if (login && !login.includes('@')) {
			const res = await supabase.rpc('get_email_by_username', { username_input: login });
			if (!res.data || res.data.length === 0) throw new Error('Пользователь не найден');
			login = res.data[0].email;
		}

		// Логинг
		const { data: userData, error } = await supabase.auth.signInWithPassword({
			email: login,
			password: password,
		});

		if (error?.message === 'Email not confirmed') {
			authFormStore.switchToConfirm(login);
			throw new Error('Подтвердите e-mail, прежде чем войти');
		}

		if (error?.message === 'Invalid login credentials') throw new Error('Неверное имя пользователя или пароль');

		if (error?.message === 'missing email or phone') throw new Error('Неверное имя пользователя или пароль');

		if (error || !userData?.user) throw new Error(error?.message || 'Неверное имя пользователя или пароль');

		const fullName = userData.user.user_metadata?.full_name ?? 'Пользователь';

		await setUserSession({
			id: userData.user.id,
			email: userData.user.email!,
			username: fullName,
		});

		return true;
	},

	// Повторная отправка письма для подтверждения
	async handleResend(email: string): Promise<void> {
		if (!email || !email.includes('@')) throw new Error('Введите корректный e-mail');

		const existing = await authService.checkUserByEmail(email);
		if (!existing) throw new Error('Пользователь не найден');
		if (existing.email_confirmed_at) throw new Error('Этот аккаунт уже подтвержден');

		const { error } = await supabase.auth.resend({ type: 'signup', email });
		if (error) throw new Error('Не удалось отправить письмо');

		authFormStore.startTimer();
	},

	// Проверка существования пользователя по email (через RPC)
	async checkUserByEmail(email: string): Promise<SupabaseUserCheck | null> {
		const { data, error } = await supabase.rpc('check_user_by_email', { email_input: email });
		if (error || !data || data.length === 0) return null;

		return data[0];
	},

	// Запуск процедуры восстановления пароля
	async resetPassword(email: string): Promise<void> {
		const { error } = await supabase.auth.resetPasswordForEmail(email, {
			redirectTo: defaultRedirect,
		});

		if (error) throw new Error(error.message || 'Ошибка при отправке письма для сброса пароля');

		authFormStore.startTimer();
	},

	// Смена пароля пользователя
	async updatePassword(newPassword: string, newPasswordConfirm: string): Promise<void> {
		// Проверка сессии
		const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
		if (sessionError || !sessionData.session)
			throw new Error('Пользователь не авторизован. Пожалуйста, войдите заново.');

		await validatePasswords(newPassword, newPasswordConfirm);
		// Обновление пароля
		const { error } = await supabase.auth.updateUser({ password: newPassword });
		if (error) throw new Error(error.message || 'Не удалось изменить пароль');
	},

	async logout() {
		await supabase.auth.signOut();

		userStore.setUser(null);
		userProfileStore.clearProfile?.();

		storage.remove('user');
		storage.remove('userProfile');
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
