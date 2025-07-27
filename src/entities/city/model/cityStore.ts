import { makeAutoObservable, runInAction } from 'mobx';

import { DEFAULT_CITY, STORAGE_LAST_CITY } from '@/shared/lib/constants';
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
		storage.remove(STORAGE_LAST_CITY);
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

			notifyStore.setNotice('Геолокация не поддерживается вашим браузером', 'error');
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

					notifyStore.setNotice(`Выбран город: ${city.name}`, 'success');
				} catch (error: any) {
					runInAction(() => {
						this.isLoading = false;
					});

					notifyStore.setNotice(error.message || 'Ошибка при определении текущего местоположения', 'error');
				}
			},
			() => {
				runInAction(() => {
					this.isLoading = false;
				});

				notifyStore.setNotice('Не удалось получить геолокацию', 'error');
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
					storage.set(STORAGE_LAST_CITY, city);
				} else {
					const cachedCity = storage.get(STORAGE_LAST_CITY);
					this.currentCity = cachedCity ?? DEFAULT_CITY;
				}
			});
		} catch (error: any) {
			notifyStore.setNotice(error.message, 'error');
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
				storage.set(STORAGE_LAST_CITY, savedCity);
			});
		} catch (error: any) {
			notifyStore.setNotice(error.message, 'error');
		} finally {
			runInAction(() => {
				this.isLoading = false;
			});
		}
	}

	async init() {
		const savedCity = storage.get(STORAGE_LAST_CITY);

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
