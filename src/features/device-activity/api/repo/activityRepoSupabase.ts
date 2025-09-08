import type { ActivityLog, IActivityRepo } from '../../model';
import { deviceActivityService } from '../../model';

export class ActivityRepoSupabase implements IActivityRepo {
	async loadActivityLog(id: string): Promise<ActivityLog[]> {
		return deviceActivityService.loadActivityLog(id);
	}

	async saveActivityLog(id: string, log: Omit<ActivityLog, 'id' | 'created_at' | 'user_id'>): Promise<ActivityLog> {
		return deviceActivityService.saveActivityLog(id, log);
	}

	async deleteActivityLog(id: string): Promise<void> {
		return deviceActivityService.deleteActivityLog(id);
	}
}
