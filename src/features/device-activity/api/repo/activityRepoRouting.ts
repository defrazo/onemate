import type { UserStore } from '@/entities/user';
import { BaseRouting } from '@/shared/lib/repository';

import type { ActivityLog, IActivityRepo } from '../../model';
import { ActivityRepoDemo, ActivityRepoSupabase } from '.';

export class ActivityRepoRouting extends BaseRouting implements IActivityRepo {
	private readonly realRepo: IActivityRepo;
	private readonly demoRepo: IActivityRepo;

	constructor(userStore: UserStore) {
		super(userStore);
		this.realRepo = new ActivityRepoSupabase();
		this.demoRepo = new ActivityRepoDemo();
	}

	private getTargetRepo(): IActivityRepo {
		return this.role === 'demo' ? this.demoRepo : this.realRepo;
	}

	async loadActivityLog(id: string): Promise<ActivityLog[]> {
		this.checkPermission('activity', 'read');
		return this.getTargetRepo().loadActivityLog(id);
	}

	async saveActivityLog(id: string, log: Omit<ActivityLog, 'id' | 'created_at' | 'user_id'>): Promise<ActivityLog> {
		this.checkPermission('activity', 'save');
		return this.getTargetRepo().saveActivityLog(id, log);
	}

	async deleteActivityLog(id: string): Promise<void> {
		this.checkPermission('activity', 'delete');
		return this.getTargetRepo().deleteActivityLog(id);
	}
}
