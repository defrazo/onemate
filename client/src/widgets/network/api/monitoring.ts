import { api } from '@/shared/api';

import type { CreateMonitoredService, MonitoredService, MonitoringHistory, UpdateMonitoredService } from '../model';

export const getMonitoredServices = async (): Promise<MonitoredService[]> => {
	const { data } = await api.get<MonitoredService[]>('/network/services');
	return data;
};

export const getMonitoringHistory = async (serviceId: number): Promise<MonitoringHistory> => {
	const { data } = await api.get<MonitoringHistory>(`/network/services/${serviceId}/history`);
	return data;
};

export const createMonitoredService = async (data: CreateMonitoredService): Promise<MonitoredService> => {
	const { data: service } = await api.post<MonitoredService>('/network/services', data);
	return service;
};

export const checkMonitoredService = async (id: number): Promise<MonitoredService> => {
	const { data } = await api.post<MonitoredService>(`/network/services/${id}/check`);
	return data;
};

export const updateMonitoredService = async (id: number, data: UpdateMonitoredService): Promise<MonitoredService> => {
	const { data: service } = await api.patch<MonitoredService>(`/network/services/${id}`, data);
	return service;
};

export const deleteMonitoredService = async (id: number): Promise<void> => {
	await api.delete(`/network/services/${id}`);
};
