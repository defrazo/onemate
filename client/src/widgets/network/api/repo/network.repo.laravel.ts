import { api } from '@/shared/api';

import type {
	CheckVia,
	CreateMonitoredService,
	INetworkRepo,
	MonitoredService,
	MonitoringHistory,
	PortCheckResult,
	ServiceCheckResult,
	SslCheckResult,
	UpdateMonitoredService,
} from '../../model';

export class NetworkRepoLaravel implements INetworkRepo {
	async loadServices(): Promise<MonitoredService[]> {
		const { data } = await api.get<MonitoredService[]>('/network/services');
		return data;
	}

	async loadHistory(serviceId: number): Promise<MonitoringHistory> {
		const { data } = await api.get<MonitoringHistory>(`/network/services/${serviceId}/history`);
		return data;
	}

	async createService(data: CreateMonitoredService): Promise<MonitoredService> {
		const { data: service } = await api.post<MonitoredService>('/network/services', data);
		return service;
	}

	async checkMonitoredService(id: number): Promise<MonitoredService> {
		const { data } = await api.post<MonitoredService>(`/network/services/${id}/check`);
		return data;
	}

	async updateService(id: number, data: UpdateMonitoredService): Promise<MonitoredService> {
		const { data: service } = await api.patch<MonitoredService>(`/network/services/${id}`, data);
		return service;
	}

	async deleteService(id: number): Promise<void> {
		await api.delete(`/network/services/${id}`);
	}

	async reorderServices(ids: number[]): Promise<void> {
		await api.patch('/network/services/order', { ids });
	}

	async checkService(url: string, checkVia: CheckVia = 'direct'): Promise<ServiceCheckResult> {
		const { data } = await api.post<ServiceCheckResult>('/network/service/check', { url, checkVia });
		return data;
	}

	async checkPort(host: string, port: number, checkVia: CheckVia = 'direct'): Promise<PortCheckResult> {
		const { data } = await api.post<PortCheckResult>('/network/port/check', { host, port, checkVia });
		return data;
	}

	async checkSsl(host: string): Promise<SslCheckResult> {
		const { data } = await api.post<SslCheckResult>('/network/ssl/check', { host });
		return data;
	}
}
