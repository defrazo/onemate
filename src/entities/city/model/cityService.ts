import { userStore } from '@/entities/user';
import { DEFAULT_CITY } from '@/shared/lib/constants';
import { supabase } from '@/shared/lib/supabase';

import type { City } from '.';

const TABLE = 'user_cities';

export const cityService = {
	async loadCity(): Promise<City | null> {
		const id = userStore.getIdOrThrow();

		const { data, error } = await supabase.from(TABLE).select('*').eq('id', id).maybeSingle();
		if (error) throw new Error(`Ошибка получения города: ${error.message}`);

		if (!data) {
			const inserted = await this.saveCity(DEFAULT_CITY);
			return inserted;
		}

		return data;
	},

	async saveCity(city: City): Promise<City> {
		const id = userStore.getIdOrThrow();

		const cityWithId = { ...city, id };

		const { data, error } = await supabase.from(TABLE).upsert(cityWithId, { onConflict: 'id' }).select().single();
		if (error) throw new Error(`Ошибка сохранения города: ${error.message}`);

		return data;
	},
};
