import { api } from '@/shared/api';

import type { MonitoredService } from '../model/types';

type CreateMonitoredServiceData = {
	name: string;
	url: string;
};

export const createMonitoredService = async (data: CreateMonitoredServiceData): Promise<MonitoredService> => {
	const { data: service } = await api.post<MonitoredService>('/network/services', data);

	return service;
};
