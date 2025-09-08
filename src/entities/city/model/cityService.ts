import { createDefaultCity } from '@/shared/lib/constants';
import { supabase } from '@/shared/lib/supabase';

import type { City } from '.';

const TABLE = 'user_cities';

export const cityService = {
	async loadCity(id: string): Promise<City> {
		const { data, error } = await supabase.from(TABLE).select('*').eq('id', id).maybeSingle();
		if (error) throw new Error(`Произошла ошибка при загрузке местоположения: ${error.message}`);

		if (!data) {
			void cityService.saveCity(id, createDefaultCity());
			return createDefaultCity();
		}

		return data as City;
	},

	async saveCity(id: string, city: City): Promise<void> {
		const { error } = await supabase.from(TABLE).upsert({ ...city, id }, { onConflict: 'id' });
		if (error) throw new Error(`Произошла ошибка при сохранении местоположения: ${error.message}`);
	},

	async deleteCity(id: string): Promise<void> {
		const { error } = await supabase.from(TABLE).upsert({ ...createDefaultCity(), id }, { onConflict: 'id' });
		if (error) throw new Error(`Произошла ошибка при удалении местоположения: ${error.message}`);
	},
};
