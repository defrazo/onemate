import { makeAutoObservable, reaction } from 'mobx';

import type { IBaseCityPort } from '@/entities/city';
import type { IBaseUserPort } from '@/entities/user';
import { cache } from '@/shared/lib/cache';
import type { Status } from '@/shared/stores';

import { fetchWeatherData } from '../api';
import type { CurrentType, ForecastType } from './types';

export class WeatherStore {
	private disposers = new Set<() => void>();
	private inited: boolean = false;
	private status: Status = 'idle';
	private error: string | null = null;

	current: CurrentType | null = null;
	forecast: ForecastType[] = [];
	isOpenCurrent: boolean = true;

	get isLoading(): boolean {
		return this.status === 'loading';
	}

	get isReady(): boolean {
		return this.current != null && this.forecast.length > 0;
	}

	get isError(): boolean {
		return this.status === 'error';
	}

	get errorMessage(): string | null {
		return this.error;
	}

	setIsOpenCurrent(): void {
		this.isOpenCurrent = !this.isOpenCurrent;
	}

	private async loadWeather(): Promise<void> {
		if (!this.userStore.id || this.isLoading) return;

		this.setLoading();

		try {
			const { weather, forecast } = await fetchWeatherData(this.cityStore.name);
			if (weather) this.setReady(weather, forecast);
		} catch (error) {
			this.setError(error);
			return;
		}
	}

	constructor(
		private readonly userStore: IBaseUserPort,
		private readonly cityStore: IBaseCityPort
	) {
		makeAutoObservable<this, 'userStore' | 'cityStore' | 'inited' | 'disposers'>(this, {
			userStore: false,
			cityStore: false,
			inited: false,
			disposers: false,
		});
	}

	init(): void {
		if (this.inited) return;
		this.inited = true;

		reaction(
			() => this.userStore.id,
			(id) => {
				if (!id) {
					this.reset();
					return;
				}

				const cached = cache.getWeather(id);
				if (cached) {
					this.current = cached.current;
					this.forecast = cached.forecast;
					this.status = 'ready';
				}
			},
			{ fireImmediately: true }
		);

		this.track(
			reaction(
				() => [this.cityStore.isReady, this.cityStore.name] as const,
				([isReady]) => isReady && this.loadWeather(),
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
		this.inited = false;
	}

	private setLoading(): void {
		this.status = 'loading';
		this.error = null;
	}

	private setReady(current: CurrentType, forecast: ForecastType[]): void {
		this.status = 'ready';
		this.error = null;
		this.current = current;
		this.forecast = forecast;
		if (this.userStore.id) cache.setWeather(this.userStore.id, current, forecast);
	}

	private setError(error: unknown): void {
		this.status = this.current != null && this.forecast.length > 0 ? 'ready' : 'error';
		this.error = error instanceof Error ? error.message : String(error);
	}

	private reset(): void {
		this.status = 'idle';
		this.error = null;
		this.current = null;
		this.forecast = [];
		this.isOpenCurrent = true;
	}

	private track(disposer?: (() => void) | void): void {
		if (!disposer) return;
		this.disposers.add(disposer);
	}
}
