import { api } from '@/shared/api';

import type {
	AddressCheckResult,
	CreateMonitoredService,
	INetworkRepo,
	MonitoredService,
	MonitoringHistory,
	PortCheckResult,
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

	async checkService(id: number): Promise<MonitoredService> {
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

	async checkAddress(url: string): Promise<AddressCheckResult> {
		const { data } = await api.post<AddressCheckResult>('/network/address/check', { url });
		return data;
	}

	async checkPort(host: string, port: number): Promise<PortCheckResult> {
		const { data } = await api.post<PortCheckResult>('/network/port/check', { host, port });
		return data;
	}

	async checkSsl(host: string): Promise<SslCheckResult> {
		const { data } = await api.post<SslCheckResult>('/network/ssl/check', { host });
		return data;
	}
}
