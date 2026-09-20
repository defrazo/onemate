import { makeAutoObservable, runInAction } from 'mobx';

import {
	checkMonitoredService,
	createMonitoredService,
	deleteMonitoredService,
	getMonitoredServices,
	updateMonitoredService,
} from '../api';
import type { CreateMonitoredService, MonitoredService, UpdateMonitoredService } from '.';

export class NetworkStore {
	services: MonitoredService[] = [];
	isLoading = false;
	isReady = false;
	error: string | null = null;

	constructor() {
		makeAutoObservable(this);
	}

	async loadServices(): Promise<void> {
		if (this.isLoading) {
			return;
		}

		this.isLoading = true;
		this.error = null;

		try {
			const services = await getMonitoredServices();

			runInAction(() => {
				this.services = services;
				this.isReady = true;
			});
		} catch (error) {
			runInAction(() => {
				this.error = error instanceof Error ? error.message : 'Не удалось загрузить ресурсы.';
			});
		} finally {
			runInAction(() => {
				this.isLoading = false;
			});
		}
	}

	async addService(data: CreateMonitoredService): Promise<MonitoredService> {
		const service = await createMonitoredService(data);

		runInAction(() => {
			this.services.unshift(service);
		});

		return service;
	}

	async checkService(id: number): Promise<MonitoredService> {
		const service = await checkMonitoredService(id);

		runInAction(() => {
			const index = this.services.findIndex((currentService) => currentService.id === service.id);

			if (index !== -1) {
				this.services[index] = service;
			}
		});

		return service;
	}

	async updateService(id: number, data: UpdateMonitoredService): Promise<MonitoredService> {
		const service = await updateMonitoredService(id, data);

		runInAction(() => {
			const index = this.services.findIndex((currentService) => currentService.id === id);

			if (index !== -1) {
				this.services[index] = service;
			}
		});

		return service;
	}

	async deleteService(id: number): Promise<void> {
		await deleteMonitoredService(id);

		runInAction(() => {
			this.services = this.services.filter((service) => service.id !== id);
		});
	}
}
