import { makeAutoObservable, runInAction } from 'mobx';

import { storage } from '@/shared/lib/storage/localStorage';

import { fetchRates } from '../api';
import { currencyIcons, currencyNames } from '../lib';
import { RatesList, RatesResponse } from '.';

class CurrencyStore {
	data: RatesResponse | null = storage.get('rates') || null;
	isLoading = false;
	error: string | null = null;

	constructor() {
		makeAutoObservable(this);
		this.updateRates();
	}

	private updateRates() {
		if (this.data?.lastUpdate) {
			const lastUpdateDate = new Date(this.data.lastUpdate * 1000).toISOString().split('T')[0];
			const currentDate = new Date().toISOString().split('T')[0];
			if (lastUpdateDate !== currentDate) fetchRates();
		} else fetchRates();
	}

	get ratesList() {
		if (!this.data?.rates) return {};

		runInAction(() => {
			if (this.data?.rates) {
				this.data.rates.RUB = 1;
			}
		});

		return Object.keys(this.data.rates)
			.filter((item) => item !== 'XDR')
			.sort()
			.reduce((acc, key) => {
				acc[key] = {
					code: key,
					icon: currencyIcons[key],
					name: currencyNames[key] || key,
					value: this.data!.rates[key],
				};
				return acc;
			}, {} as RatesList);
	}
	async fetchRates() {
		this.isLoading = true;
		this.error = null;

		const result = await fetchRates();
		storage.set('rates', result);

		runInAction(() => {
			if (result) {
				this.data = result;
			} else {
				this.error = 'Не удалось загрузить курсы валют';
			}
			this.isLoading = false;
		});
	}
}

export const currencyStore = new CurrencyStore();
