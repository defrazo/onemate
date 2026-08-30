import type { City } from '@/entities/city';
import { storage } from '@/shared/lib/storage';
import { key, toPlain } from '@/shared/lib/utils';

import type { IUserLocationRepo, UserLocationType } from '../../model';

export class UserLocationRepoDemo implements IUserLocationRepo {
	constructor(private readonly type: UserLocationType) {}

	async load(userId: string): Promise<City | null> {
		const stored = storage.get(key(userId, `location:${this.type}`));
		if (!stored || typeof stored !== 'object') return null;

		return structuredClone(stored as City);
	}

	async save(userId: string, city: City): Promise<void> {
		storage.set(key(userId, `location:${this.type}`), toPlain(city));
	}

	async delete(userId: string): Promise<void> {
		storage.remove(key(userId, `location:${this.type}`));
	}
}
