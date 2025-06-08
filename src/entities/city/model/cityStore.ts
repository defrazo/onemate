import { makeAutoObservable, runInAction } from 'mobx';

import { storage } from '@/shared/lib/storage/localStorage';
import { appStore } from '@/shared/store/appStore';

import { fetchCityByCoordinates } from '../api';
import { City } from '.';

const DEFAULT_CITY: City = {
	// id: '',
	name: 'Москва',
	region: 'Центральный',
	lat: 55.7558,
	lon: 37.6173,
	country: 'Russia',
};
const LAST_CITY_KEY = 'lastCityLocation';

export class CityStore {
	currentCity: City = DEFAULT_CITY;
	isLoading = false;
	success = '';
	error = '';

	constructor() {
		makeAutoObservable(this);
		this.currentCity = storage.get(LAST_CITY_KEY) ?? DEFAULT_CITY;
	}

	setCurrentCity(city: City) {
		this.currentCity = city;
		storage.set(LAST_CITY_KEY, city);
		console.log(city, 'Город установлен');
	}

	// async detectCityByIP() {
	// 	this.isLoading = true;
	// 	this.error = '';

	// 	try {
	// 		const city = await fetchCityByIP();
	// 		if (!city) throw new Error('Город не определён');

	// 		runInAction(() => {
	// 			this.setCurrentCity(city);
	// 			this.success = `Выбран город: ${city.name}`;
	// 		});
	// 	} catch (e: any) {
	// 		runInAction(() => {
	// 			this.error = e.message || 'Ошибка определения города';
	// 		});
	// 	} finally {
	// 		runInAction(() => {
	// 			this.isLoading = false;
	// 		});
	// 	}
	// }

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
						appStore.setSuccess(`Выбран город: ${city.name}`);
						// this.success = `Выбран город: ${city.name}`;
					});
				} catch (error: any) {
					runInAction(() => {
						appStore.setError(error.message || 'Ошибка при определении текущего местоположения');
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

	get cityName(): string {
		return this.currentCity?.name || '';
	}

	get cityRegion(): string {
		return this.currentCity?.region || '';
	}

	get cityCoordinates(): { lat: number; lon: number } {
		return { lat: this.currentCity.lat, lon: this.currentCity.lon };
	}
}

export const cityStore = new CityStore();
