import type { City } from '@/entities/city';

import type { ActivityLog, DeviceData } from '.';

export interface IActivityRepo {
	loadActivityLog(id: string): Promise<ActivityLog[]>;
	saveActivityLog(id: string, log: Omit<ActivityLog, 'id' | 'created_at' | 'user_id'>): Promise<ActivityLog>;
	deleteActivityLog(id: string): Promise<void>;
}

export interface IDeviceProvider {
	getDeviceData(city: City): Promise<DeviceData>;
}
