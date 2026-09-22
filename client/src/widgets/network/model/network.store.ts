import { action, makeObservable, observable, reaction } from 'mobx';

import type { IBaseUserPort } from '@/entities/user';
import { AsyncStore } from '@/shared/lib/store';

import { networkCache } from '../lib';
import type {
	CreateMonitoredService,
	INetworkRepo,
	MonitoredService,
	MonitoringHistory,
	PortCheckResult,
	ServiceCheckResult,
	SslCheckResult,
	UpdateMonitoredService,
} from '.';

export class NetworkStore extends AsyncStore {
	services: MonitoredService[] = [];
	isReady = false;

	async loadServices(userId: string): Promise<void> {
		const cached = networkCache.read(userId);
		if (cached) this.applyServices(cached.services);

		if (this.isLoading) return;

		await this.withLoading(async () => {
			const services = await this.repo.loadServices();

			if (this.userStore.id !== userId) return;

			this.applyServices(services);
			networkCache.write(userId, services);
		});
	}

	async loadHistory(id: number): Promise<MonitoringHistory> {
		return this.repo.loadHistory(id);
	}

	async addService(data: CreateMonitoredService): Promise<MonitoredService> {
		const service = await this.repo.createService(data);

		this.prependService(service);
		this.persistCache();

		return service;
	}

	async checkMonitoredService(id: number): Promise<MonitoredService> {
		const service = await this.repo.checkMonitoredService(id);

		this.replaceService(service);
		this.persistCache();

		return service;
	}

	async updateService(id: number, data: UpdateMonitoredService): Promise<MonitoredService> {
		const service = await this.repo.updateService(id, data);

		this.replaceService(service);
		this.persistCache();

		return service;
	}

	async deleteService(id: number): Promise<void> {
		await this.repo.deleteService(id);

		this.removeService(id);
		this.persistCache();
	}

	async checkService(url: string): Promise<ServiceCheckResult> {
		return this.repo.checkService(url);
	}

	async checkPort(host: string, port: number): Promise<PortCheckResult> {
		return this.repo.checkPort(host, port);
	}

	async checkSsl(host: string): Promise<SslCheckResult> {
		return this.repo.checkSsl(host);
	}

	private applyServices(services: MonitoredService[]): void {
		this.services = services;
		this.isReady = true;
	}

	private prependService(service: MonitoredService): void {
		this.services.unshift(service);
	}

	private replaceService(service: MonitoredService): void {
		const index = this.services.findIndex((currentService) => currentService.id === service.id);
		if (index !== -1) this.services[index] = service;
	}

	private removeService(id: number): void {
		this.services = this.services.filter((service) => service.id !== id);
	}

	private persistCache(): void {
		const userId = this.userStore.id;
		if (!userId) return;

		networkCache.write(userId, this.services);
	}

	constructor(
		private readonly userStore: IBaseUserPort,
		private readonly repo: INetworkRepo
	) {
		super();

		makeObservable<this, 'applyServices' | 'prependService' | 'replaceService' | 'removeService' | 'reset'>(this, {
			services: observable,
			isReady: observable,

			applyServices: action,
			prependService: action,
			replaceService: action,
			removeService: action,
			reset: action,
		});
	}

	init(): void {
		if (this.inited) return;
		this.inited = true;

		this.track(
			reaction(
				() => this.userStore.id,
				(userId) => {
					if (!userId) {
						this.reset();
						return;
					}

					void this.loadServices(userId);
				},
				{ fireImmediately: true }
			)
		);
	}

	protected reset(): void {
		this.services = [];
		this.isReady = false;
	}
}
