import { supabase } from '@/shared/lib/supabase';

export const getCurrentUser = async () => {
	const { data, error } = await supabase.auth.getUser();

	if (error) throw error;
	if (!data.user) throw new Error('Пользователь не авторизован');

	return data.user;
};
