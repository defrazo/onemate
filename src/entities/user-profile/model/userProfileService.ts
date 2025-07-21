import { userStore } from '@/entities/user';
import { DEFAULT_USER_PROFILE } from '@/shared/lib/constants';
import { supabase } from '@/shared/lib/supabase';

import type { UserProfile } from '.';

const TABLE = 'user_profiles';

export const userProfileService = {
	async loadProfile() {
		const id = userStore.id;
		if (!id) throw new Error('Пользователь не авторизован');

		const { data, error, status } = await supabase.from(TABLE).select('*').eq('id', id).maybeSingle();
		if (error && status !== 406) throw error;

		if (!data) {
			const inserted = await this.saveProfile(DEFAULT_USER_PROFILE);
			return inserted;
		} else return data;
	},

	async saveProfile(profile: UserProfile): Promise<UserProfile> {
		const id = userStore.id;
		if (!id) throw new Error('Пользователь не авторизован');

		const profileWithId = { ...profile, id };

		const { data, error } = await supabase
			.from(TABLE)
			.upsert(profileWithId, { onConflict: 'id' })
			.select()
			.single();
		if (error) throw new Error(`Ошибка сохранения профиля: ${error.message}`);

		return data;
	},
};
