import { makeAutoObservable, reaction } from 'mobx';

import type { IBaseUserPort } from '@/entities/user';
import { locationChannel } from '@/shared/lib/broadcast';
import { createDefaultCity } from '@/shared/lib/constants';
import { storage } from '@/shared/lib/storage';
import { key } from '@/shared/lib/utils';
import type { Status } from '@/shared/stores';

import { fetchCityByIP } from '../api';
import type { City, IBaseCityPort, ICityDeviceActivityPort, ICityLocationPort, ICityRepo } from '.';

export class CityStore implements IBaseCityPort, ICityDeviceActivityPort, ICityLocationPort {
	private debounce: ReturnType<typeof setTimeout> | null = null;
	private disposers = new Set<() => void>();
	private inited: boolean = false;
	private status: Status = 'idle';
	private error: string | null = null;

	private data: City | null = null;

	get isLoading(): boolean {
		return this.status === 'loading';
	}

	get isReady(): boolean {
		return this.status === 'ready' && this.data !== null;
	}

	get isError(): boolean {
		return this.status === 'error';
	}

	get errorMessage(): string | null {
		return this.error;
	}

	get city(): City {
		return this.data ?? createDefaultCity();
	}

	get name(): string {
		return this.city.name ?? '';
	}

	get region(): string {
		return this.city.region ?? '';
	}

	setCity(city: City): void {
		if (this.sameCity(this.city, city)) return;

		this.setReady(city);
		locationChannel.emit({ type: 'location_updated', city: this.name });
		this.scheduleServerUpdate(city);
	}

	deleteCity(): void {
		this.setCity(createDefaultCity());

		if (this.userStore.id) {
			this.clearDebounce();
			void this.repo.deleteCity(this.userStore.id);
		}
	}

	private scheduleServerUpdate(city: City): void {
		if (!this.userStore.id) return;

		this.clearDebounce();
		this.debounce = setTimeout(() => void this.repo.saveCity(this.userStore.id!, city), 500);
	}

	private sameCity(a: City, b: City): boolean {
		return a.name === b.name && a.lat === b.lat && a.lon === b.lon && (a.region ?? '') === (b.region ?? '');
	}

	private async loadCity(): Promise<void> {
		if (!this.userStore.id || this.isLoading) return;

		this.setLoading();

		try {
			const city = await this.repo.loadCity(this.userStore.id!);
			city ? this.setReady(city) : await this.detectCityByIP();
		} catch (error) {
			this.setError(error);
			await this.detectCityByIP();
		}
	}

	private async detectCityByIP(): Promise<void> {
		if (!this.userStore.id) return;

		this.setLoading();

		try {
			const city = await fetchCityByIP();
			this.setReady(city ?? createDefaultCity());
		} catch (error) {
			this.setError(error);
		}
	}

	constructor(
		private readonly userStore: IBaseUserPort,
		private readonly repo: ICityRepo
	) {
		makeAutoObservable<this, 'userStore' | 'repo' | 'inited' | 'disposers' | 'debounce'>(this, {
			userStore: false,
			repo: false,
			inited: false,
			disposers: false,
			debounce: false,
		});
	}

	init(): void {
		if (this.inited) return;
		this.inited = true;

		this.track(
			reaction(
				() => this.userStore.id,
				async (id) => (id ? await this.loadCity() : this.reset()),
				{ fireImmediately: true }
			)
		);
	}

	destroy(): void {
		this.disposers.forEach((dispose) => {
			try {
				dispose();
			} catch {}
		});
		this.disposers.clear();
		this.clearDebounce();
		this.inited = false;
	}

	restart(): void {
		this.destroy();
		this.init();
	}

	private setLoading(): void {
		this.status = 'loading';
		this.error = null;
	}

	private setReady(data: City): void {
		this.status = 'ready';
		this.error = null;
		this.data = data;
	}

	private setError(error: unknown): void {
		this.status = this.data ? 'ready' : 'error';
		this.error = error instanceof Error ? error.message : String(error);
	}

	private reset(): void {
		this.status = 'idle';
		this.error = null;
		this.data = null;
		this.clearDebounce();

		if (this.userStore.lastId) storage.remove(key(this.userStore.lastId, 'city'));
	}

	private clearDebounce(): void {
		if (this.debounce) {
			clearTimeout(this.debounce);
			this.debounce = null;
		}
	}

	private track(disposer?: (() => void) | void): void {
		if (!disposer) return;
		this.disposers.add(disposer);
	}
}
