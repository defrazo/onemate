import { api } from '@/shared/api';

import type { MonitoredService } from '../model/types';

export const getMonitoredServices = async (): Promise<MonitoredService[]> => {
	const { data } = await api.get<MonitoredService[]>('/network/services');

	return data;
};
