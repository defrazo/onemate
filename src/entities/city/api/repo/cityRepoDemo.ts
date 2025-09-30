import { createDemoCity } from '@/shared/lib/constants';
import { storage } from '@/shared/lib/storage';
import { key, toPlain } from '@/shared/lib/utils';

import type { City, ICityRepo } from '../../model';

export class CityRepoDemo implements ICityRepo {
	async loadCity(id: string): Promise<City> {
		const stored = storage.get(key(id, 'city'));
		if (stored && typeof stored === 'object') return structuredClone(stored);

		const demoCity = createDemoCity();
		storage.set(key(id, 'city'), demoCity);
		return demoCity;
	}

	async saveCity(id: string, city: City): Promise<void> {
		storage.set(key(id, 'city'), toPlain(city));
	}

	async deleteCity(id: string): Promise<void> {
		storage.set(key(id, 'city'), null);
	}
}
