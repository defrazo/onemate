import { action, computed, makeObservable, observable, reaction, runInAction } from 'mobx';

import { type City, createDefaultCity, fetchCityByIP, isSameCity } from '@/entities/city';
import type { IBaseUserPort } from '@/entities/user';
import type { IUserLocationRepo } from '@/entities/user-location';
import { AsyncStore } from '@/shared/lib/store';

import { fetchWeatherData } from '../api/fetchWeatherData';
import { weatherCache } from '../lib/weatherCache';
import type { CurrentType, ForecastType, View } from './types';

export class WeatherStore extends AsyncStore {
	private initializing: Promise<void> | null = null;
	private generation = 0;
	private currentLocation: City | null = null;

	isInitialized = false;
	isRefreshing = false;

	current: CurrentType | null = null;
	forecast: ForecastType[] = [];
	view: View = 'current';

	get isReady(): boolean {
		return this.current !== null && this.forecast.length > 0;
	}

	get location(): City | null {
		return this.currentLocation;
	}

	get locationName(): string {
		return this.currentLocation?.name ?? '';
	}

	ensureLoaded(): Promise<void> {
		const userId = this.userStore.id;
		if (!userId || this.isInitialized) return Promise.resolve();

		if (this.initializing) return this.initializing;

		const promise = this.initialize(userId);

		this.initializing = promise;

		void promise
			.finally(() => {
				if (this.initializing === promise) this.initializing = null;
			})
			.catch(() => {});

		return promise;
	}

	setView(view: View): void {
		this.view = view;
	}

	async setLocation(city: City): Promise<void> {
		if (this.currentLocation && isSameCity(this.currentLocation, city)) return;

		const userId = this.userStore.id;
		if (!userId || this.isLoading) return;

		await this.withLoading(async () => {
			const weatherData = await this.fetchWeather(city);

			if (this.userStore.id !== userId) return;

			await this.locationRepo.save(userId, city);

			if (this.userStore.id !== userId) return;

			this.applyLocation(city);
			this.applyWeather(weatherData.current, weatherData.forecast);

			weatherCache.write(userId, weatherData.current, weatherData.forecast);
		});
	}

	async reload(): Promise<void> {
		const userId = this.userStore.id;
		const location = this.currentLocation;

		if (!userId || !location || this.isLoading) return;

		runInAction(() => (this.isRefreshing = true));

		try {
			await this.withLoading(async () => {
				const weatherData = await this.fetchWeather(location);

				if (this.userStore.id !== userId) return;

				this.applyWeather(weatherData.current, weatherData.forecast);
				weatherCache.write(userId, weatherData.current, weatherData.forecast);
			});
		} finally {
			runInAction(() => (this.isRefreshing = false));
		}
	}

	private async initialize(userId: string): Promise<void> {
		const generation = this.generation;
		const isActual = () => this.userStore.id === userId && this.generation === generation;

		const cached = weatherCache.read(userId);
		if (cached && isActual()) this.applyWeather(cached.current, cached.forecast);

		await this.withLoading(async () => {
			const location = await this.resolveLocation(userId);
			if (!isActual()) return;

			this.applyLocation(location);

			const weatherData = await this.fetchWeather(location);
			if (!isActual()) return;

			this.applyWeather(weatherData.current, weatherData.forecast);
			weatherCache.write(userId, weatherData.current, weatherData.forecast);

			runInAction(() => (this.isInitialized = true));
		});
	}

	private async resolveLocation(userId: string): Promise<City> {
		const saved = await this.locationRepo.load(userId);
		if (saved) return saved;

		const detected = await fetchCityByIP();
		const location = detected ?? createDefaultCity();

		await this.locationRepo.save(userId, location);

		return location;
	}

	private async fetchWeather(location: City): Promise<{ current: CurrentType; forecast: ForecastType[] }> {
		const { weather, forecast } = await fetchWeatherData(location.lat, location.lon);
		if (!weather || forecast.length === 0) throw new Error('Не удалось загрузить данные о погоде');

		return { current: weather, forecast };
	}

	private applyLocation(location: City): void {
		this.currentLocation = location;
	}

	private applyWeather(current: CurrentType, forecast: ForecastType[]): void {
		this.current = current;
		this.forecast = forecast;
	}

	constructor(
		private readonly userStore: IBaseUserPort,
		private readonly locationRepo: IUserLocationRepo
	) {
		super();

		makeObservable<this, 'currentLocation' | 'applyLocation' | 'applyWeather' | 'reset'>(this, {
			isInitialized: observable,
			isRefreshing: observable,
			currentLocation: observable,
			current: observable,
			forecast: observable,
			view: observable,

			isReady: computed,
			location: computed,
			locationName: computed,

			setView: action,
			applyLocation: action,
			applyWeather: action,
			reset: action,
		});
	}

	init(): void {
		if (this.inited) return;
		this.inited = true;

		this.track(
			reaction(
				() => this.userStore.id,
				() => this.reset()
			)
		);
	}

	protected reset(): void {
		this.initializing = null;
		this.generation++;

		this.isInitialized = false;
		this.isRefreshing = false;
		this.currentLocation = null;
		this.current = null;
		this.forecast = [];
		this.view = 'current';

		this.setError(null);
	}
}
