import { storage } from '@/shared/lib/storage';
import { key, toPlain } from '@/shared/lib/utils';

import type { City, ICityRepo } from '../../model';

export class CityRepoDemo implements ICityRepo {
	constructor(private readonly loadInitialCity: (id: string) => Promise<City>) {}

	async loadCity(id: string): Promise<City> {
		const stored = storage.get(key(id, 'city'));
		if (stored && typeof stored === 'object') return structuredClone(stored as City);

		const initial = await this.loadInitialCity(id);
		storage.set(key(id, 'city'), toPlain(initial));
		return structuredClone(initial);
	}

	async saveCity(id: string, city: City): Promise<void> {
		storage.set(key(id, 'city'), toPlain(city));
	}

	async deleteCity(id: string): Promise<void> {
		storage.remove(key(id, 'city'));
	}
}
