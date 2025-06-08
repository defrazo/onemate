import { makeAutoObservable, runInAction } from 'mobx';

import { type City, cityStore } from '@/entities/city';

import { fetchCitiesByName } from '../api';
import { regionsDictionary } from '../lib';
// import { fetchCityByCoordinates } from '@/entities/city';

export class SearchCityStore {
	query: string = ''; // Запрос, который вводит пользователь
	searchResults: City[] = []; // Результаты поиска
	isLoading: boolean = false;
	error: string = '';

	constructor() {
		makeAutoObservable(this);
	}

	setQuery(query: string) {
		this.query = query;
	}

	// get currentQuery(): string {
	// 	return this.query || '';
	// }

	setResults(results: City[]) {
		this.searchResults = results;
	}

	resetResults() {
		this.searchResults = [];
	}

	async fetchCities(query: string, signal: AbortSignal) {
		if (query.length < 3) {
			this.searchResults = [];
			return;
		}
		this.isLoading = true;
		this.error = '';
		try {
			const cities = await fetchCitiesByName(query, signal);
			const translatedCities = cities
				.map((city) => {
					const regionKey = city.region?.toLowerCase();
					if (regionKey && regionsDictionary[regionKey]) {
						city.region = regionsDictionary[regionKey];
					}
					return city;
				})
				.sort((a, b) => {
					const priority = { RU: 1, BY: 2, UA: 3 };
					const getPriority = (country: string) => priority[country as keyof typeof priority] || 99;
					return getPriority(a.country) - getPriority(b.country);
				});
			runInAction(() => {
				// this.setResults(translatedCities);
				this.searchResults = translatedCities;
			});
		} catch (e: any) {
			runInAction(() => {
				this.error = e.message || 'Ошибка загрузки городов';
			});
		} finally {
			runInAction(() => {
				this.isLoading = false;
			});
		}
	}

	// Функция для выбора города из результатов поиска
	selectCity(city: City) {
		// Обновление города в CityStore
		cityStore.setCurrentCity(city);
	}
}

export const searchCityStore = new SearchCityStore();
