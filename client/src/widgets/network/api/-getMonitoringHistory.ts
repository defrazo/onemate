import { api } from '@/shared/api';

import type { MonitoringHistory } from '../model/types';

export const getMonitoringHistory = async (serviceId: number): Promise<MonitoringHistory> => {
	const { data } = await api.get<MonitoringHistory>(`/network/services/${serviceId}/history`);

	return data;
};
