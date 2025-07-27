import { makeAutoObservable, runInAction } from 'mobx';

import type { City } from '@/entities/city';
import { cityStore } from '@/entities/city';
import { handleError } from '@/shared/lib/errors';
import { notifyStore } from '@/shared/stores';

import { checkWeatherAvailability, fetchCitiesByName } from '../api';
import { regionsDictionary } from '../lib';

export class SearchCityStore {
	private abortController: AbortController | null = null;

	query: string = '';
	searchResults: City[] = [];
	isLoading: boolean = false;

	setQuery(query: string) {
		this.query = query;
	}

	resetResults() {
		this.searchResults = [];
	}

	async fetchCities(query: string) {
		this.abortController?.abort();
		this.abortController = new AbortController();
		this.isLoading = true;

		try {
			if (query.length < 3) {
				this.searchResults = [];
				return;
			}

			const cities = await fetchCitiesByName(query, this.abortController.signal);
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
			runInAction(() => {
				this.searchResults = translatedCities;
			});
		} catch (error) {
			handleError(error);
		} finally {
			runInAction(() => {
				this.isLoading = false;
			});
		}
	}

	async selectCity(city: City) {
		try {
			const hasWeather = await checkWeatherAvailability(city.lat, city.lon);

			if (!hasWeather) {
				notifyStore.setNotice(`Прогноз для этого города недоступен`, 'error');
				return;
			}

			cityStore.setCurrentCity(city);
			notifyStore.setNotice(`Выбран город: ${city.name}`, 'success');

			this.setQuery(city.name);
			this.resetResults();
		} catch (error) {
			handleError(error);
			notifyStore.setNotice('Ошибка при выборе города', 'error');
		}
	}

	constructor() {
		makeAutoObservable(this);
	}
}

export const searchCityStore = new SearchCityStore();
