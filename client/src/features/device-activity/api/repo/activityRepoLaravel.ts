import { api } from '@/shared/api';

import type { ActivityLog, IActivityRepo } from '../../model';

type ActivityListResponse = {
	logs: ActivityLog[];
};

type ActivityResponse = {
	log: ActivityLog;
};

export class ActivityRepoLaravel implements IActivityRepo {
	async loadActivityLog(_id: string): Promise<ActivityLog[]> {
		const { data } = await api.get<ActivityListResponse>('/user/activity');
		return data.logs;
	}

	async saveActivityLog(_id: string, log: Omit<ActivityLog, 'id' | 'created_at' | 'user_id'>): Promise<ActivityLog> {
		const { data } = await api.post<ActivityResponse>('/user/activity', log);
		return data.log;
	}

	async deleteActivityLog(_id: string): Promise<void> {
		await api.delete('/user/activity');
	}
}
