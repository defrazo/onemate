import type { Provider } from '@supabase/supabase-js';

import { userService } from '@/entities/user';
import { DEFAULT_REDIRECT } from '@/shared/lib/constants';
import { supabase } from '@/shared/lib/supabase';
import { validateEmail, validatePasswords, validateUsername } from '@/shared/lib/validators';

export const authService = {
	async oAuth(provider: Provider): Promise<boolean> {
		const { error } = await supabase.auth.signInWithOAuth({ provider, options: { redirectTo: DEFAULT_REDIRECT } });
		if (error) throw new Error(error.message || 'Ошибка при авторизации через провайдера');

		return true;
	},

	async register(username: string, email: string, password: string, passwordConfirm: string): Promise<boolean> {
		await validateUsername(username);
		await validateEmail(email);
		await validatePasswords(password, passwordConfirm);

		const { data, error } = await supabase.auth.signUp({
			email: email.trim().toLowerCase(),
			password,
			options: { data: { username: username.trim() }, emailRedirectTo: DEFAULT_REDIRECT },
		});

		if (error || !data?.user) throw new Error(error?.message || 'Произошла ошибка при регистрации');

		return true;
	},

	async login(login: string, password: string): Promise<boolean> {
		let email = login.trim();

		if (!email.includes('@')) {
			const resolved = await userService.resolveEmailByUsername(email.toLowerCase());
			if (!resolved) throw new Error('Неверное имя пользователя или пароль');
			email = resolved;
		}

		const { data, error } = await supabase.auth.signInWithPassword({ email: email.toLowerCase(), password });
		if (error || !data?.user) throw new Error('Неверное имя пользователя или пароль');

		return true;
	},

	async resendConfirmation(email: string): Promise<boolean> {
		const normalized = email?.trim().toLowerCase();
		if (!normalized || !normalized.includes('@')) throw new Error('Введите корректный e‑mail');

		const { error } = await supabase.auth.resend({ type: 'signup', email: normalized });
		if (error) throw new Error('Не удалось отправить письмо');

		return true;
	},

	async resetPassword(email: string): Promise<boolean> {
		const normalized = email.trim().toLowerCase();

		const { error } = await supabase.auth.resetPasswordForEmail(normalized, { redirectTo: DEFAULT_REDIRECT });
		if (error) throw new Error(error.message || 'Произошла ошибка при отправке письма для сброса пароля');

		return true;
	},

	async getCurrentEmail(): Promise<string | null> {
		const { data, error } = await supabase.auth.getUser();
		if (error) return null;

		return data.user?.email ?? null;
	},

	async logout(): Promise<void> {
		const { error } = await supabase.auth.signOut();
		if (error) throw new Error(error.message || 'Не удалось выйти из аккаунта');
	},
};
