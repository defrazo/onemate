import { api } from '@/shared/api';

import type { MonitoredService, UpdateMonitoredServiceData } from '../model/types';

export const updateMonitoredService = async (
	id: number,
	data: UpdateMonitoredServiceData
): Promise<MonitoredService> => {
	const { data: service } = await api.patch<MonitoredService>(`/network/services/${id}`, data);

	return service;
};
