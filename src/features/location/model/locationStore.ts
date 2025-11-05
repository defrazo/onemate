import { makeAutoObservable, reaction } from 'mobx';

import type { City, ICityLocationPort } from '@/entities/city';
import { fetchCityByCoordinates } from '@/entities/city';
import type { IBaseUserPort } from '@/entities/user';
import type { Status } from '@/shared/stores';

import { checkWeatherAvailability, fetchCitiesByName } from '../api';
import { regionsDictionary } from '../lib';

export class LocationStore {
	private debounce: ReturnType<typeof setTimeout> | null = null;
	private abort: AbortController | null = null;
	private disposers = new Set<() => void>();
	private inited: boolean = false;
	private status: Status = 'idle';
	private error: string | null = null;

	private isSelecting = false;
	private isFocused: boolean = false;
	private query: string = '';

	searchResults: City[] = [];

	get inputValue(): string {
		return this.isFocused || this.isSelecting ? this.query : this.cityStore.name;
	}

	get isLoading(): boolean {
		return this.status === 'loading';
	}

	get isReady(): boolean {
		return this.status === 'ready';
	}

	get isError(): boolean {
		return this.status === 'error';
	}

	get errorMessage(): string | null {
		return this.error;
	}

	startSelecting(): void {
		this.isSelecting = true;
	}

	finishSelecting(): void {
		this.isSelecting = false;
	}

	setFocused(value: boolean): void {
		if (!value && this.isSelecting) return;

		this.isFocused = value;

		if (value) this.query = '';
		else {
			this.status = 'idle';
			this.error = null;
			this.setSearchResults([]);
			this.abort?.abort();
		}
	}

	setQuery(value: string): void {
		this.query = value;
	}

	setSearchResults(results: City[]): void {
		this.searchResults = results;
	}

	async selectCity(city: City): Promise<void> {
		try {
			const hasWeather = await checkWeatherAvailability(city.lat, city.lon);
			if (!hasWeather) throw new Error('Данный город недоступен для выбора');

			this.applySelectedCity(city);
			this.setReady();
		} catch (error: any) {
			this.setError(error);
			throw new Error(error.message || 'Произошла ошибка при выборе города');
		}
	}

	async detectCityByGeolocation(): Promise<City> {
		this.setLoading();

		if (!navigator.geolocation) {
			this.setError(new Error('Геолокация не поддерживается вашим браузером'));
			throw new Error('Геолокация не поддерживается вашим браузером');
		}

		return new Promise((resolve, reject) => {
			navigator.geolocation.getCurrentPosition(
				async (position) => {
					const { latitude, longitude } = position.coords;

					try {
						const city = await fetchCityByCoordinates(latitude, longitude);
						if (!city) throw new Error('Город не найден по координатам');

						this.applySelectedCity(city);
						this.setReady();
						resolve(city);
					} catch (error: any) {
						this.setError(error);
						reject(error.message ?? new Error('Произошла ошибка при определении местоположения'));
					}
				},
				(error) => {
					this.setError(error);
					reject(error ?? new Error('Не удалось получить геолокацию'));
				},
				{ enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 }
			);
		});
	}

	private applySelectedCity(city: City): void {
		this.abort?.abort();
		this.query = city.name;
		this.isFocused = false;
		this.cityStore.setCity(city);
		this.setSearchResults([]);
	}

	private handleQueryChange(query: string) {
		if (this.debounce) clearTimeout(this.debounce);

		if (query.length < 3) {
			this.setSearchResults([]);
			return;
		}

		this.debounce = setTimeout(() => this.fetchCities(query), 1000);
	}

	private loadLocation(): void {
		this.query = this.cityStore.name;
	}

	private async fetchCities(query: string): Promise<void> {
		this.abort?.abort();
		this.abort = new AbortController();

		if (!this.isLoading) this.setLoading();

		try {
			const cities = await fetchCitiesByName(query, this.abort.signal);

			const translatedCities = cities
				.map((city) => {
					const regionKey = city.region?.toLowerCase();
					if (regionKey && regionsDictionary[regionKey]) city.region = regionsDictionary[regionKey];
					return city;
				})
				.sort((a, b) => {
					const priority = { RU: 1, BY: 2, UA: 3 };
					const getPriority = (country: string) => priority[country as keyof typeof priority] || 99;
					return getPriority(a.country) - getPriority(b.country);
				});

			this.setSearchResults(translatedCities);
			this.setReady();
		} catch (error: any) {
			if (error?.name === 'AbortError') return;
			this.setError(error);
		}
	}

	constructor(
		private readonly userStore: IBaseUserPort,
		private readonly cityStore: ICityLocationPort
	) {
		makeAutoObservable<this, 'userStore' | 'cityStore' | 'inited' | 'disposers' | 'debounce' | 'abort'>(this, {
			userStore: false,
			cityStore: false,
			inited: false,
			disposers: false,
			debounce: false,
			abort: false,
		});

		this.track(
			reaction(
				() => (this.isFocused ? this.query.trim() : ''),
				(query) => this.handleQueryChange(query)
			)
		);

		this.track(
			reaction(
				() => [this.cityStore.isReady, this.cityStore.name] as const,
				([isReady, name]) => {
					if (isReady && name) void this.loadLocation();
				},
				{ fireImmediately: true }
			)
		);
	}

	init(): void {
		if (this.inited) return;
		this.inited = true;

		this.track(
			reaction(
				() => this.userStore.id,
				(id) => !id && this.reset(),
				{ fireImmediately: true }
			)
		);

		this.track(
			reaction(
				() => [this.cityStore.isReady, this.cityStore.name] as const,
				([isReady]) => isReady && this.loadLocation(),
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
		this.abort?.abort();
		this.clearDebounce();
		this.inited = false;
	}

	private setLoading(): void {
		this.status = 'loading';
		this.error = null;
	}

	private setReady(): void {
		this.status = 'ready';
		this.error = null;
	}

	private setError(error: unknown): void {
		this.status = 'error';
		this.error = error instanceof Error ? error.message : String(error);
	}

	private reset(): void {
		this.status = 'idle';
		this.error = null;
		this.query = '';
		this.setSearchResults([]);
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
