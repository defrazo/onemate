import { action, computed, makeObservable, observable, reaction } from 'mobx';

import { type City, fetchCityByCoordinates } from '@/entities/city';
import { AsyncStore, Debouncer } from '@/shared/lib/store';

import { fetchCitiesByName } from '../api';
import { regionsDictionary } from '../lib';

export class LocationSearchStore extends AsyncStore {
	private readonly searchDebouncer = new Debouncer();

	private abortController: AbortController | null = null;
	private selecting = false;
	private focused = false;
	private query = '';
	private committedValue = '';

	searchResults: City[] = [];

	get inputValue(): string {
		return this.query;
	}

	startSelecting(): void {
		this.selecting = true;
	}

	finishSelecting(): void {
		this.selecting = false;
	}

	setFocused(value: boolean): void {
		if (!value && this.selecting) return;

		this.focused = value;

		if (value) {
			this.query = '';
			this.applySearchResults([]);
			return;
		}

		this.cancelSearch();
		this.query = this.committedValue;
		this.applySearchResults([]);
	}

	setQuery(value: string): void {
		this.query = value;
	}

	setValue(city: City | null): void {
		this.committedValue = city?.name ?? '';

		if (!this.focused) this.query = this.committedValue;
	}

	selectCity(city: City): void {
		this.cancelSearch();

		this.committedValue = city.name;
		this.query = city.name;
		this.focused = false;

		this.applySearchResults([]);
	}

	async detectCityByGeolocation(): Promise<City> {
		if (!navigator.geolocation) throw new Error('Геолокация не поддерживается вашим браузером');

		return this.withLoading(async () => {
			const position = await this.getCurrentPosition();

			const city = await fetchCityByCoordinates(position.coords.latitude, position.coords.longitude);
			if (!city) throw new Error('Город не найден по координатам');

			// this.selectCity(city);

			return city;
		});
	}

	private handleQueryChange(query: string): void {
		this.searchDebouncer.cancel();

		if (query.length < 3) {
			this.cancelRequest();
			this.applySearchResults([]);
			return;
		}

		this.searchDebouncer.schedule(() => void this.fetchCities(query), 1000);
	}

	private async fetchCities(query: string): Promise<void> {
		this.cancelRequest();

		const controller = new AbortController();
		this.abortController = controller;

		await this.withLoading(async () => {
			const cities = await fetchCitiesByName(query, controller.signal);

			if (controller.signal.aborted) return;

			const results = cities
				.map((city) => ({ ...city, region: this.translateRegion(city.region) }))
				.sort((a, b) => this.getCountryPriority(a.country) - this.getCountryPriority(b.country));

			this.applySearchResults(results);
		});
	}

	private applySearchResults(results: City[]): void {
		this.searchResults = results;
	}

	private translateRegion(region?: string): string | undefined {
		if (!region) return region;
		return regionsDictionary[region.toLowerCase()] ?? region;
	}

	private getCountryPriority(country: string): number {
		const priority: Record<string, number> = { RU: 1, BY: 2, UA: 3 };
		return priority[country] ?? 99;
	}

	private getCurrentPosition(): Promise<GeolocationPosition> {
		return new Promise((resolve, reject) => {
			navigator.geolocation.getCurrentPosition(resolve, reject, {
				enableHighAccuracy: false,
				timeout: 10000,
				maximumAge: 60000,
			});
		});
	}

	private cancelRequest(): void {
		this.abortController?.abort();
		this.abortController = null;
	}

	private cancelSearch(): void {
		this.searchDebouncer.cancel();
		this.cancelRequest();
	}

	constructor() {
		super();

		makeObservable<this, 'selecting' | 'focused' | 'query' | 'committedValue' | 'applySearchResults' | 'reset'>(
			this,
			{
				selecting: observable,
				focused: observable,
				query: observable,
				committedValue: observable,

				searchResults: observable,

				inputValue: computed,

				startSelecting: action,
				finishSelecting: action,
				setFocused: action,
				setQuery: action,
				setValue: action,
				selectCity: action,
				applySearchResults: action,
				reset: action,
			}
		);
	}

	init(): void {
		if (this.inited) return;
		this.inited = true;

		this.track(
			reaction(
				() => (this.focused ? this.query.trim() : ''),
				(query) => this.handleQueryChange(query)
			)
		);
	}

	override destroy(): void {
		this.cancelSearch();
		super.destroy();
	}

	protected reset(): void {
		this.cancelSearch();

		this.selecting = false;
		this.focused = false;
		this.query = '';
		this.committedValue = '';
		this.searchResults = [];
	}
}
