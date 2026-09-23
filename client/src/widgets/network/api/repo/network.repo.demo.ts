import type { User } from '@/entities/user';
import { api } from '@/shared/api';
import { storage } from '@/shared/lib/storage';
import { key, toPlain } from '@/shared/lib/utils';

import type {
	CreateMonitoredService,
	HttpMonitoredService,
	INetworkRepo,
	MonitoredService,
	MonitoringCheck,
	MonitoringHistory,
	PortCheckResult,
	ServiceCheckResult,
	SslCheckResult,
	TcpMonitoredService,
	UpdateMonitoredService,
} from '../../model';

export class NetworkRepoDemo implements INetworkRepo {
	constructor(private readonly getCurrentUser: () => User | null) {}

	async loadServices(): Promise<MonitoredService[]> {
		return this.readServices();
	}

	async loadHistory(serviceId: number): Promise<MonitoringHistory> {
		const history = this.readHistory(serviceId);

		return {
			checks: history,
			uptime: this.calculateUptime(history),
			incidents: history.filter((check) => check.status === 'down').length,
		};
	}

	async createService(data: CreateMonitoredService): Promise<MonitoredService> {
		const user = this.getCurrentUser();
		if (!user) throw new Error('Нет активного пользователя');

		const services = this.readServices();
		const now = new Date().toISOString();

		const base = {
			id: this.getNextId(services),
			userId: user.id,
			name: data.name,
			isActive: true,
			lastStatus: null,
			lastResponseTime: null,
			lastCheckedAt: null,
			createdAt: now,
			updatedAt: now,
		};

		const service: MonitoredService =
			data.type === 'http'
				? { ...base, type: 'http', url: data.url, lastStatusCode: null }
				: { ...base, type: 'tcp', host: data.host, port: data.port };

		this.writeServices([service, ...services]);

		return structuredClone(service);
	}

	async checkMonitoredService(id: number): Promise<MonitoredService> {
		const services = this.readServices();
		const index = services.findIndex((service) => service.id === id);

		if (index === -1) throw new Error('Сервис не найден');

		const currentService = services[index];
		const now = new Date().toISOString();

		let service: MonitoredService;
		let check: MonitoringCheck;

		if (currentService.type === 'http') {
			const result = await this.checkService(currentService.url);

			service = {
				...currentService,
				lastStatus: result.status,
				lastStatusCode: result.statusCode,
				lastResponseTime: result.responseTime,
				lastCheckedAt: now,
				updatedAt: now,
			};

			check = {
				status: result.status,
				statusCode: result.statusCode,
				responseTime: result.responseTime,
				checkedAt: now,
			};
		} else {
			const result = await this.checkPort(currentService.host, currentService.port);
			const status = result.status === 'open' ? 'up' : 'down';

			service = {
				...currentService,
				lastStatus: status,
				lastResponseTime: result.responseTime,
				lastCheckedAt: now,
				updatedAt: now,
			};

			check = {
				status,
				statusCode: null,
				responseTime: result.responseTime,
				checkedAt: now,
			};
		}

		services[index] = service;

		this.writeServices(services);
		this.appendHistory(id, check);

		return structuredClone(service);
	}

	async updateService(id: number, data: UpdateMonitoredService): Promise<MonitoredService> {
		const services = this.readServices();
		const index = services.findIndex((service) => service.id === id);

		if (index === -1) throw new Error('Сервис не найден');

		const currentService = services[index];

		if (currentService.type !== data.type) throw new Error('Тип мониторинга нельзя изменить');

		let service: MonitoredService;
		let targetChanged = false;

		if (currentService.type === 'http' && data.type === 'http') {
			targetChanged = data.url !== undefined && data.url !== currentService.url;

			const updated: HttpMonitoredService = {
				...currentService,
				...data,
				...(targetChanged && {
					lastStatus: null,
					lastStatusCode: null,
					lastResponseTime: null,
					lastCheckedAt: null,
				}),
				updatedAt: new Date().toISOString(),
			};

			service = updated;
		} else if (currentService.type === 'tcp' && data.type === 'tcp') {
			targetChanged =
				(data.host !== undefined && data.host !== currentService.host) ||
				(data.port !== undefined && data.port !== currentService.port);

			const updated: TcpMonitoredService = {
				...currentService,
				...data,
				...(targetChanged && {
					lastStatus: null,
					lastResponseTime: null,
					lastCheckedAt: null,
				}),
				updatedAt: new Date().toISOString(),
			};

			service = updated;
		} else {
			throw new Error('Тип мониторинга нельзя изменить');
		}

		services[index] = service;
		this.writeServices(services);

		if (targetChanged) this.removeHistory(id);

		return structuredClone(service);
	}

	async deleteService(id: number): Promise<void> {
		this.writeServices(this.readServices().filter((service) => service.id !== id));
		this.removeHistory(id);
	}

	async checkService(url: string): Promise<ServiceCheckResult> {
		const { data } = await api.post<ServiceCheckResult>('/network/service/check', { url });
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

	private readServices(): MonitoredService[] {
		const user = this.getCurrentUser();
		if (!user) throw new Error('Нет активного пользователя');

		const services = storage.get(key(user.id, 'network-services'));

		return Array.isArray(services) ? structuredClone(services) : [];
	}

	private writeServices(services: MonitoredService[]): void {
		const user = this.getCurrentUser();
		if (!user) throw new Error('Нет активного пользователя');

		storage.set(key(user.id, 'network-services'), toPlain(services));
	}

	private readHistory(serviceId: number): MonitoringCheck[] {
		const user = this.getCurrentUser();
		if (!user) throw new Error('Нет активного пользователя');

		const history = storage.get(key(user.id, `network-history-${serviceId}`));

		return Array.isArray(history) ? structuredClone(history) : [];
	}

	private writeHistory(serviceId: number, history: MonitoringCheck[]): void {
		const user = this.getCurrentUser();
		if (!user) throw new Error('Нет активного пользователя');

		storage.set(key(user.id, `network-history-${serviceId}`), toPlain(history));
	}

	private appendHistory(serviceId: number, check: MonitoringCheck): void {
		const history = this.readHistory(serviceId);
		this.writeHistory(serviceId, [...history, check]);
	}

	private removeHistory(serviceId: number): void {
		const user = this.getCurrentUser();
		if (!user) throw new Error('Нет активного пользователя');

		storage.remove(key(user.id, `network-history-${serviceId}`));
	}

	private calculateUptime(history: MonitoringCheck[]): number | null {
		if (history.length === 0) return null;

		const successful = history.filter((check) => check.status === 'up').length;

		return (successful / history.length) * 100;
	}

	private getNextId(services: MonitoredService[]): number {
		return Math.max(0, ...services.map((service) => service.id)) + 1;
	}
}
