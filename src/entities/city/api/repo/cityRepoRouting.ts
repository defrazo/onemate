import type { UserStore } from '@/entities/user';
import { BaseRouting } from '@/shared/lib/repository';

import type { City, ICityRepo } from '../../model';
import { CityRepoDemo, CityRepoSupabase } from '.';

export class CityRepoRouting extends BaseRouting implements ICityRepo {
	private readonly realRepo: ICityRepo;
	private readonly demoRepo: ICityRepo;

	constructor(userStore: UserStore) {
		super(userStore);
		this.realRepo = new CityRepoSupabase();
		this.demoRepo = new CityRepoDemo();
	}

	private getTargetRepo(): ICityRepo {
		return this.role === 'demo' ? this.demoRepo : this.realRepo;
	}

	async loadCity(id: string): Promise<City> {
		this.checkPermission('city', 'read');
		return this.getTargetRepo().loadCity(id);
	}

	async saveCity(id: string, city: City): Promise<void> {
		this.checkPermission('city', 'save');
		return this.getTargetRepo().saveCity(id, city);
	}

	async deleteCity(id: string): Promise<void> {
		this.checkPermission('city', 'delete');
		return this.getTargetRepo().deleteCity(id);
	}
}
