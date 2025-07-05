import { makeAutoObservable, runInAction } from 'mobx';

import { storage } from '@/shared/lib/storage/localStorage';
import { notifyStore } from '@/shared/stores';

import { fetchCityByCoordinates, fetchCityByIP } from '../api';
import { City } from '.';

const DEFAULT_CITY: City = {
	name: 'Москва',
	region: 'Центральный',
	lat: 55.7558,
	lon: 37.6173,
	country: 'Russia',
};

const LAST_CITY_KEY = 'lastCityLocation';

export class CityStore {
	private wasResetOnce = false;

	currentCity: City = DEFAULT_CITY;
	isLoading = false;
	success = '';
	error = '';

	get cityName(): string {
		return this.currentCity?.name || '';
	}

	get cityRegion(): string {
		return this.currentCity?.region || '';
	}

	get cityCoordinates(): { lat: number; lon: number } {
		return { lat: this.currentCity.lat, lon: this.currentCity.lon };
	}

	initCity() {
		const savedCity = storage.get(LAST_CITY_KEY);

		if (savedCity) this.setCurrentCity(savedCity);

		if (!savedCity && this.isDefaultCity()) this.detectCityByIP();
	}

	isDefaultCity(): boolean {
		return (
			this.currentCity.name === DEFAULT_CITY.name &&
			this.currentCity.lat === DEFAULT_CITY.lat &&
			this.currentCity.lon === DEFAULT_CITY.lon
		);
	}

	setCurrentCity(city: City) {
		this.currentCity = city;
		storage.set(LAST_CITY_KEY, city);
	}

	async resetCurrentCity() {
		if (this.wasResetOnce) return;

		this.setCurrentCity(DEFAULT_CITY);
		await this.detectCityByIP();

		this.wasResetOnce = true;
	}

	async detectCityByGeolocation() {
		this.isLoading = true;
		this.error = '';

		if (!navigator.geolocation) {
			runInAction(() => {
				this.error = 'Геолокация не поддерживается вашим браузером';
				this.isLoading = false;
			});
			return;
		}

		navigator.geolocation.getCurrentPosition(
			async (position) => {
				const { latitude, longitude } = position.coords;

				try {
					const city = await fetchCityByCoordinates(latitude, longitude);

					if (!city) throw new Error('Город не найден по координатам');

					runInAction(() => {
						this.setCurrentCity(city);
						notifyStore.setSuccess(`Выбран город: ${city.name}`);
					});
				} catch (error: any) {
					runInAction(() => {
						notifyStore.setError(error.message || 'Ошибка при определении текущего местоположения');
					});
				} finally {
					runInAction(() => {
						this.isLoading = false;
					});
				}
			},
			(error) => {
				runInAction(() => {
					this.error = 'Не удалось получить геолокацию';
					this.isLoading = false;
				});
			}
		);
	}

	private async detectCityByIP() {
		this.isLoading = true;

		try {
			const city = await fetchCityByIP();
			this.setCurrentCity(city ?? DEFAULT_CITY);
		} catch {
		} finally {
			runInAction(() => {
				this.isLoading = false;
			});
		}
	}

	constructor() {
		makeAutoObservable(this);
		this.initCity();
	}
}

export const cityStore = new CityStore();
