import { api } from '@/shared/api';

import type { MonitoredService } from '../model/types';

export const checkMonitoredService = async (id: number): Promise<MonitoredService> => {
	const { data } = await api.post<MonitoredService>(`/network/services/${id}/check`);

	return data;
};
