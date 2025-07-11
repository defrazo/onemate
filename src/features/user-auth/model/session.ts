import type { User } from '@/entities/user';
import { userStore } from '@/entities/user';
import { userProfileStore } from '@/entities/user-profile';
import { storage } from '@/shared/lib/storage';
import { supabase } from '@/shared/lib/supabase';

export const setUserSession = async (user: User): Promise<void> => {
	const { data: profile, error } = await supabase.from('user_profiles').select('*').eq('id', user.id).single();

	if (error || !profile) throw error || new Error('Профиль пользователя не найден');

	userStore.setUser(user);
	userProfileStore.setProfile(profile);

	storage.set('user', user);
	storage.set('userProfile', profile);
	storage.set('isAuth', true);
};
