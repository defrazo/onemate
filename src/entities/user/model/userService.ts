import type { Session, User } from '@supabase/supabase-js';

import { supabase } from '@/shared/lib/supabase';

import type { UserByEmail } from '.';

export const userService = {
	async getSession(): Promise<Session | null> {
		const { data, error } = await supabase.auth.getSession();
		if (error) throw new Error(`Произошла ошибка при загрузке сессии: ${error.message}`);

		return data.session ?? null;
	},

	async getUser(): Promise<User | null> {
		const { data, error } = await supabase.auth.getUser();
		if (error) throw new Error(`Произошла ошибка при загрузке пользователя: ${error.message}`);

		return data.user ?? null;
	},

	async updateUsername(username: string): Promise<User | null> {
		const { data, error } = await supabase.auth.updateUser({ data: { username } });
		if (error) throw new Error(`Произошла ошибка при обновлении имени пользователя: ${error.message}`);

		return data.user ?? null;
	},

	async updateEmail(email: string): Promise<User | null> {
		const {
			data: { user },
		} = await supabase.auth.getUser();

		if (user?.app_metadata?.provider !== 'email') throw new Error('Смена email недоступна для OAuth-аккаунтов');

		const { data, error } = await supabase.auth.updateUser({ email });
		if (error) throw new Error(`Произошла ошибка при обновлении e-mail пользователя: ${error.message}`);

		return data.user ?? null;
	},

	async updatePassword(newPassword: string): Promise<User | null> {
		const { data, error } = await supabase.auth.updateUser({ password: newPassword });
		if (error) throw new Error(`Произошла ошибка при обновлении пароля пользователя: ${error.message}`);

		return data.user ?? null;
	},

	async resolveEmailByUsername(username: string): Promise<string | null> {
		const { data, error } = await supabase.rpc('get_email_by_username', { username_input: username.toLowerCase() });
		if (error) throw new Error(`Произошла ошибка при получении e-mail пользователя: ${error.message}`);

		if (!data || data.length !== 1 || !data[0]?.email) return null;

		return String(data[0].email);
	},

	async checkUserByEmail(emailOrUsername: string): Promise<UserByEmail | null> {
		let email = emailOrUsername.trim();

		if (!email.includes('@')) {
			const byUsername = await userService.resolveEmailByUsername(email);
			if (!byUsername) return null;
			email = byUsername;
		}

		const { data, error } = await supabase.rpc('check_user_by_email', { email_input: email.toLowerCase() });
		if (error || !data || data.length === 0) return null;

		return data[0] as UserByEmail;
	},

	onAuthStateChange(cb: (user: User | null) => void): () => void {
		const { data } = supabase.auth.onAuthStateChange((_event, session) => cb(session?.user ?? null));
		return () => data.subscription.unsubscribe();
	},
};
