import { action, computed, makeObservable, observable, reaction } from 'mobx';

import { type City, createDefaultCity, fetchCityByIP, isSameCity } from '@/entities/city';
import type { IBaseUserPort } from '@/entities/user';
import type { IUserLocationRepo } from '@/entities/user-location';
import { AsyncStore } from '@/shared/lib/store';

import { fetchWeatherData } from '../api';
import { weatherCache } from '../lib';
import type { CurrentType, ForecastType } from '.';

export class WeatherStore extends AsyncStore {
	private currentLocation: City | null = null;

	current: CurrentType | null = null;
	forecast: ForecastType[] = [];
	isOpenCurrent = true;

	get isReady(): boolean {
		return this.current !== null && this.forecast.length > 0;
	}

	get location(): City | null {
		return this.currentLocation;
	}

	get locationName(): string {
		return this.currentLocation?.name ?? '';
	}

	setIsOpenCurrent(): void {
		this.isOpenCurrent = !this.isOpenCurrent;
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

		await this.withLoading(async () => {
			const weatherData = await this.fetchWeather(location);

			if (this.userStore.id !== userId) return;

			this.applyWeather(weatherData.current, weatherData.forecast);

			weatherCache.write(userId, weatherData.current, weatherData.forecast);
		});
	}

	private async initialize(userId: string): Promise<void> {
		if (this.isLoading) return;

		const cached = weatherCache.read(userId);
		if (cached && this.userStore.id === userId) this.applyWeather(cached.current, cached.forecast);

		await this.withLoading(async () => {
			const location = await this.resolveLocation(userId);
			if (this.userStore.id !== userId) return;

			const weatherData = await this.fetchWeather(location);
			if (this.userStore.id !== userId) return;

			this.applyLocation(location);
			this.applyWeather(weatherData.current, weatherData.forecast);

			weatherCache.write(userId, weatherData.current, weatherData.forecast);
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
			currentLocation: observable,
			current: observable,
			forecast: observable,
			isOpenCurrent: observable,

			isReady: computed,
			location: computed,
			locationName: computed,

			setIsOpenCurrent: action,
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
				(userId) => {
					if (!userId) {
						this.reset();
						return;
					}

					void this.initialize(userId);
				},
				{ fireImmediately: true }
			)
		);
	}

	protected reset(): void {
		this.currentLocation = null;
		this.current = null;
		this.forecast = [];
		this.isOpenCurrent = true;
	}
}
