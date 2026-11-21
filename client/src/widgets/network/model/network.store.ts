import { action, makeObservable, observable, reaction, runInAction } from 'mobx';

import type { IBaseUserPort } from '@/entities/user';
import { AsyncStore } from '@/shared/lib/store';

import { networkCache } from '../lib/networkCache';
import type { INetworkRepo } from './ports';
import type {
	CheckVia,
	CreateMonitoredService,
	MonitoredService,
	MonitoringHistory,
	PortCheckResult,
	ServiceCheckResult,
	SslCheckResult,
	UpdateMonitoredService,
} from './types';

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
			let services: MonitoredService[];

			try {
				services = await this.repo.loadServices();
			} catch (error) {
				if (this.current(userId, generation)) throw error;
				return;
			}

			if (this.userStore.id !== userId || this.generation !== generation) return;

			this.applyServices(services);
			networkCache.write(userId, services);
		});
	}

	async loadHistory(id: number): Promise<MonitoringHistory> {
		return this.repo.loadHistory(id);
	}

	async addService(data: CreateMonitoredService): Promise<MonitoredService> {
		return this.change(
			() => this.repo.createService(data),
			(service) => this.prependService(service)
		);
	}

	async checkMonitoredService(id: number): Promise<MonitoredService> {
		return this.change(
			() => this.repo.checkMonitoredService(id),
			(service) => this.replaceService(service)
		);
	}

	async updateService(id: number, data: UpdateMonitoredService): Promise<MonitoredService> {
		return this.change(
			() => this.repo.updateService(id, data),
			(service) => this.replaceService(service)
		);
	}

	async deleteService(id: number): Promise<void> {
		await this.change(
			() => this.repo.deleteService(id),
			() => this.removeService(id)
		);
	}

	private async change<T>(operation: () => Promise<T>, apply: (result: T) => void): Promise<T> {
		const userId = this.userStore.id;
		const generation = this.generation;
		const result = await operation();

		if (this.current(userId, generation)) {
			runInAction(() => apply(result));
			this.persistCache(userId, generation);
		}

		return result;
	}

	private current(userId: string | null, generation: number): boolean {
		return this.inited && !!userId && this.userStore.id === userId && this.generation === generation;
	}

	async updateOrder(services: MonitoredService[]): Promise<void> {
		if (this.isReordering) return;

		const userId = this.userStore.id;
		const generation = this.generation;

		const previous = [...this.services];
		const next = services.map((service, idx) => ({ ...service, orderIdx: idx }));

		this.isReordering = true;
		this.services = next;
		this.persistCache();

		try {
			await this.repo.reorderServices(next.map((service) => service.id));
		} catch (error) {
			if (this.current(userId, generation))
				runInAction(() => {
					this.services = previous;
					this.persistCache();
				});

			throw error;
		} finally {
			if (this.current(userId, generation)) runInAction(() => (this.isReordering = false));
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

	private persistCache(userId = this.userStore.id, generation = this.generation): void {
		if (!userId || !this.current(userId, generation)) return;

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

	override destroy(): void {
		this.reset();
		super.destroy();
	}
}
