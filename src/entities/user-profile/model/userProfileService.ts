import type { Theme } from '@/features/theme-switcher';
import { createDefaultProfile } from '@/shared/lib/constants';
import { supabase } from '@/shared/lib/supabase';

import type { UserProfile } from '.';

const TABLE = 'user_profiles';
const FIELDS = 'first_name, last_name, birth_year, birth_month, birth_day, gender, phone, email';

export const userProfileService = {
	async loadProfile(id: string): Promise<UserProfile> {
		const { data, error } = await supabase.from(TABLE).select('*').eq('id', id).maybeSingle();
		if (error) return createDefaultProfile();

		if (!data) {
			void userProfileService.updateProfile(id, createDefaultProfile());
			return createDefaultProfile();
		}

		return data as UserProfile;
	},

	async updateProfile(id: string, profile: UserProfile): Promise<UserProfile> {
		const { data, error } = await supabase
			.from(TABLE)
			.upsert({ ...profile, id }, { onConflict: 'id' })
			.select(FIELDS)
			.single();

		if (error) throw new Error(`Произошла ошибка при сохранении профиля: ${error.message}`);

		return data as UserProfile;
	},

	async updateAvatar(id: string, avatar_url: string): Promise<void> {
		const { error } = await supabase.from(TABLE).update({ avatar_url }).eq('id', id);
		if (error) throw new Error(`Произошла ошибка при сохранении аватара: ${error.message}`);
	},

	async updateTheme(id: string, theme: Theme): Promise<void> {
		const { error } = await supabase.from(TABLE).update({ theme }).eq('id', id);
		if (error) throw new Error(`Произошла ошибка при сохранении темы: ${error.message}`);
	},

	async updateWidgets(id: string, widgets_sequence: string[]): Promise<void> {
		const { error } = await supabase.from(TABLE).upsert({ id, widgets_sequence }, { onConflict: 'id' });
		if (error) throw new Error(`Произошла ошибка при сохранении порядка виджетов: ${error.message}`);
	},

	async updateSlots(id: string, widgets_slots: string[]): Promise<void> {
		const { error } = await supabase.from(TABLE).upsert({ id, widgets_slots }, { onConflict: 'id' });
		if (error) throw new Error(`Произошла ошибка при сохранении виджетов: ${error.message}`);
	},

	async markPasswordChanged(id: string): Promise<string | null> {
		const iso = new Date().toISOString();

		const { error } = await supabase.from(TABLE).update({ password_changed_at: iso }).eq('id', id);
		if (error) throw new Error(`Произошла ошибка при загрузке пользователя: ${error.message}`);

		return iso;
	},

	async deleteAccount(id: string): Promise<string | null> {
		const iso = new Date().toISOString();

		const { error } = await supabase.from(TABLE).update({ deleted_at: iso }).eq('id', id);
		if (error) throw new Error(`Произошла ошибка при удалении аккаунта: ${error.message}`);

		return iso;
	},

	async restoreAccount(id: string): Promise<void> {
		const { error } = await supabase.from(TABLE).update({ deleted_at: null }).eq('id', id);
		if (error) throw new Error(`Произошла ошибка при восстановлении аккаунта: ${error.message}`);
	},
};
