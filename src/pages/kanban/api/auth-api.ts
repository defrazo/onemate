import { supabase } from '@/shared/lib/supabase';

import type { Role } from './repo';

export const getCurrentUser = async () => {
	const { data, error } = await supabase.auth.getUser();

	if (error) throw new Error('Ошибка сети');
	if (!data.user) throw new Error('Пользователь не авторизован');

	return data.user;
};

export const getUserRole = async (): Promise<Role> => {
	const user = await getCurrentUser();
	const role = user.app_metadata?.role;

	return role === 'user' ? 'user' : 'demo';
};
