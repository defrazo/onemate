import type { ActivityLog, DeviceData } from '.';

export type ActivityLogInput = Omit<ActivityLog, 'id' | 'created_at' | 'user_id'>;

export interface IActivityRepo {
	loadActivityLog(userId: string): Promise<ActivityLog[]>;
	saveActivityLog(userId: string, log: ActivityLogInput): Promise<ActivityLog>;
	deleteActivityLog(userId: string): Promise<void>;
}

export interface IDeviceProvider {
	getDeviceData(): Promise<DeviceData>;
}
