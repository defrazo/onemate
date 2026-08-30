import type { City } from '@/entities/city';
import type { UserStore } from '@/entities/user';
import { BaseRouting } from '@/shared/lib/repository';

import type { IUserLocationRepo, UserLocationType } from '../../model';
import { UserLocationRepoDemo, UserLocationRepoLaravel } from '.';

export class UserLocationRepoRouting extends BaseRouting implements IUserLocationRepo {
	private readonly realRepo: IUserLocationRepo;
	private readonly demoRepo: IUserLocationRepo;

	constructor(userStore: UserStore, type: UserLocationType) {
		super(userStore);
		this.realRepo = new UserLocationRepoLaravel(type);
		this.demoRepo = new UserLocationRepoDemo(type);
	}

	private getTargetRepo(): IUserLocationRepo {
		return this.role === 'demo' ? this.demoRepo : this.realRepo;
	}

	async load(userId: string) {
		this.checkPermission('location', 'read');
		return this.getTargetRepo().load(userId);
	}

	async save(userId: string, city: City) {
		this.checkPermission('location', 'save');
		return this.getTargetRepo().save(userId, city);
	}

	async delete(userId: string) {
		this.checkPermission('location', 'delete');
		return this.getTargetRepo().delete(userId);
	}
}
