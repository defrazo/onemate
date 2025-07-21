import { makeAutoObservable, runInAction } from 'mobx';

import { DEFAULT_CITY, LAST_CITY_KEY } from '@/shared/lib/constants';
import { storage } from '@/shared/lib/storage';
import { notifyStore } from '@/shared/stores';

import { fetchCityByCoordinates, fetchCityByIP } from '../api';
import type { City } from '.';
import { cityService } from '.';

export class CityStore {
	isLoading = false;
	currentCity: City = DEFAULT_CITY;

	get cityName(): string {
		return this.currentCity?.name || '';
	}

	get cityRegion(): string {
		return this.currentCity?.region || '';
	}

	get cityCoordinates(): { lat: number; lon: number } {
		return { lat: this.currentCity.lat, lon: this.currentCity.lon };
	}

	isDefaultCity(): boolean {
		return (
			this.currentCity.name === DEFAULT_CITY.name &&
			this.currentCity.lat === DEFAULT_CITY.lat &&
			this.currentCity.lon === DEFAULT_CITY.lon
		);
	}

	clearCity(): void {
		storage.remove(LAST_CITY_KEY);
	}

	async setCurrentCity(city: City) {
		this.currentCity = city;
		await this.saveCity(city);
	}

	async resetCurrentCity() {
		await this.setCurrentCity(DEFAULT_CITY);
		await this.detectCityByIP();
	}

	async detectCityByGeolocation() {
		this.isLoading = true;

		if (!navigator.geolocation) {
			runInAction(() => {
				this.isLoading = false;
			});

			notifyStore.setError('Геолокация не поддерживается вашим браузером');
			return;
		}

		navigator.geolocation.getCurrentPosition(
			async (position) => {
				const { latitude, longitude } = position.coords;

				try {
					const city = await fetchCityByCoordinates(latitude, longitude);
					if (!city) throw new Error('Город не найден по координатам');

					await this.setCurrentCity(city);

					runInAction(() => {
						this.isLoading = false;
					});

					notifyStore.setSuccess(`Выбран город: ${city.name}`);
				} catch (error: any) {
					runInAction(() => {
						this.isLoading = false;
					});

					notifyStore.setError(error.message || 'Ошибка при определении текущего местоположения');
				}
			},
			() => {
				runInAction(() => {
					this.isLoading = false;
				});

				notifyStore.setError('Не удалось получить геолокацию');
			}
		);
	}

	async loadCity() {
		this.isLoading = true;

		try {
			const city = await cityService.loadCity();

			runInAction(() => {
				if (city) {
					this.currentCity = city;
					storage.set(LAST_CITY_KEY, city);
				} else {
					const cachedCity = storage.get(LAST_CITY_KEY);
					this.currentCity = cachedCity ?? DEFAULT_CITY;
				}
			});
		} catch (error: any) {
			notifyStore.setError(error.message);
		} finally {
			runInAction(() => {
				this.isLoading = false;
			});
		}
	}

	async saveCity(city: City) {
		this.isLoading = true;

		try {
			const savedCity = await cityService.saveCity(city);

			runInAction(() => {
				this.currentCity = savedCity;
				storage.set(LAST_CITY_KEY, savedCity);
			});
		} catch (error: any) {
			notifyStore.setError(error.message);
		} finally {
			runInAction(() => {
				this.isLoading = false;
			});
		}
	}

	async init() {
		const savedCity = storage.get(LAST_CITY_KEY);

		if (savedCity) await this.setCurrentCity(savedCity);

		if (!savedCity && this.isDefaultCity()) await this.detectCityByIP();
	}

	private async detectCityByIP() {
		this.isLoading = true;

		try {
			const city = await fetchCityByIP();

			await this.setCurrentCity(city ?? DEFAULT_CITY);
		} catch {
		} finally {
			runInAction(() => {
				this.isLoading = false;
			});
		}
	}

	constructor() {
		makeAutoObservable(this);
	}
}

export const cityStore = new CityStore();
