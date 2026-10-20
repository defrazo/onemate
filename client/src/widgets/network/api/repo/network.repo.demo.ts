import { api } from '@/shared/api';
import { RestrictedAccess } from '@/shared/lib/errors';

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

export class NetworkRepoDemo implements INetworkRepo {
	async loadServices(): Promise<MonitoredService[]> {
		throw new RestrictedAccess();
	}

	async loadHistory(_serviceId: number): Promise<MonitoringHistory> {
		throw new RestrictedAccess();
	}

	async createService(_data: CreateMonitoredService): Promise<MonitoredService> {
		throw new RestrictedAccess();
	}

	async checkMonitoredService(_id: number): Promise<MonitoredService> {
		throw new RestrictedAccess();
	}

	async updateService(_id: number, _data: UpdateMonitoredService): Promise<MonitoredService> {
		throw new RestrictedAccess();
	}

	async deleteService(_id: number): Promise<void> {
		throw new RestrictedAccess();
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
