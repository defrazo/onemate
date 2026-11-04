import { action, makeObservable, observable, reaction, runInAction } from 'mobx';

import type { IBaseUserPort } from '@/entities/user';
import { AsyncStore } from '@/shared/lib/store';

import { networkCache } from '../lib';
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
} from '.';

export class NetworkStore extends AsyncStore {
	private initializing: Promise<void> | null = null;
	private generation = 0;

	services: MonitoredService[] = [];
	isReady = false;
	isReordering = false;

	ensureLoaded(): Promise<void> {
		const userId = this.userStore.id;
		if (!userId || this.isReady) return Promise.resolve();

		if (this.initializing) return this.initializing;

		const promise = this.loadServices(userId);
		this.initializing = promise;

		void promise
			.finally(() => {
				if (this.initializing === promise) this.initializing = null;
			})
			.catch(() => {});

		return promise;
	}

	private async loadServices(userId: string): Promise<void> {
		const generation = this.generation;
		const cached = networkCache.read(userId);

		if (cached && this.userStore.id === userId) this.applyServices(cached.services);

		await this.withLoading(async () => {
			const services = await this.repo.loadServices();

			if (this.userStore.id !== userId || this.generation !== generation) return;

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

	async updateOrder(services: MonitoredService[]): Promise<void> {
		if (this.isReordering) return;

		const previous = [...this.services];
		const next = services.map((service, index) => ({ ...service, orderIdx: index }));

		this.isReordering = true;
		this.services = next;
		this.persistCache();

		try {
			await this.repo.reorderServices(next.map((service) => service.id));
		} catch (error) {
			runInAction(() => {
				this.services = previous;
				this.persistCache();
			});

			throw error;
		} finally {
			runInAction(() => (this.isReordering = false));
		}
	}

	async checkService(url: string, checkVia: CheckVia = 'direct'): Promise<ServiceCheckResult> {
		return this.repo.checkService(url, checkVia);
	}

	async checkPort(host: string, port: number, checkVia: CheckVia = 'direct'): Promise<PortCheckResult> {
		return this.repo.checkPort(host, port, checkVia);
	}

	async checkSsl(host: string): Promise<SslCheckResult> {
		return this.repo.checkSsl(host);
	}

	private applyServices(services: MonitoredService[]): void {
		this.services = [...services].sort((a, b) => (a.orderIdx ?? 0) - (b.orderIdx ?? 0));
		this.isReady = true;
	}

	private prependService(service: MonitoredService): void {
		this.services = [service, ...this.services.map((current) => ({ ...current, orderIdx: current.orderIdx + 1 }))];
	}

	private replaceService(service: MonitoredService): void {
		const idx = this.services.findIndex((currentService) => currentService.id === service.id);
		if (idx !== -1) this.services[idx] = service;
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
			isReordering: observable,

			updateOrder: action,
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
				() => this.reset(),
				{ fireImmediately: true }
			)
		);
	}

	protected reset(): void {
		this.generation++;
		this.initializing = null;

		this.services = [];
		this.isReady = false;
		this.isReordering = false;

		this.setError(null);
	}
}
