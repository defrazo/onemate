import { makeAutoObservable, runInAction } from 'mobx';

import { storage } from '@/shared/lib/storage';

import { fetchRates } from '../api';
import { currencyIcons, currencyNames } from '../lib';
import { Currency, CurrencyOption, RatesList, RatesResponse } from '.';

class CurrencyStore {
	data: RatesResponse | null = storage.get('rates') || null;
	isLoading: boolean = false;
	error: string | null = null;

	currencies: Currency[] = [
		{ type: 'base', code: 'USD', value: 1 },
		{ type: 'target', code: 'RUB', value: 0 },
	];

	get baseCode(): string {
		return this.currencies[0].code;
	}

	get targetCode(): string {
		return this.currencies[1].code;
	}

	get baseValue(): number {
		return this.currencies[0].value;
	}

	get targetValue(): number {
		return this.currencies[1].value;
	}

	get currencyOptions(): CurrencyOption[] {
		return Object.values(this.ratesList).map((item) => ({
			icon: item.icon,
			key: item.name,
			label: item.code,
			value: item.code,
		}));
	}

	get ratesList(): RatesList {
		if (!this.data?.rates) return {};

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

	updateCurrencies = <K extends keyof Currency>(index: number, key: K, value: Currency[K]): void => {
		const updated = [...this.currencies];
		updated[index] = { ...updated[index], [key]: value };
		this.currencies = updated;
	};

	selectCurrency = (selectedCode: string, type: 'base' | 'target'): void => {
		const base = this.currencies[0];
		const target = this.currencies[1];

		if ((type === 'base' && selectedCode === target.code) || (type === 'target' && selectedCode === base.code)) {
			this.swapCurrencies();
		} else {
			const index = type === 'base' ? 0 : 1;
			this.updateCurrencies(index, 'code', selectedCode);
		}
	};

	handleCurrencyValue = (index: number, value: number): void => {
		const from = index === 0 ? this.currencies[0].code : this.currencies[1].code;
		const to = index === 0 ? this.currencies[1].code : this.currencies[0].code;

		this.updateCurrencies(index, 'value', value);
		const converted = this.convertCurrency(value, from, to);
		this.updateCurrencies(1, 'value', converted);
	};

	swapCurrencies = (): void => {
		const [base, target] = this.currencies;
		this.currencies = [
			{ ...base, code: target.code },
			{ ...target, code: base.code },
		];
	};

	private convertCurrency = (amount: number, from: string, to: string): number => {
		const fromRate = this.ratesList[from]?.value || 1;
		const toRate = this.ratesList[to]?.value || 1;

		return Number(((amount * fromRate) / toRate).toFixed(2));
	};

	private async fetchRates(): Promise<void> {
		this.isLoading = true;
		this.error = null;

		const result = await fetchRates();

		if (result?.rates) result.rates.RUB = 1;

		storage.set('rates', result);

		runInAction(() => {
			if (result) this.data = result;
			else this.error = 'Не удалось загрузить курсы валют';
			this.isLoading = false;
		});
	}

	private async updateRates(): Promise<void> {
		const lastUpdateUnix = this.data?.lastUpdate;

		if (!lastUpdateUnix) {
			await this.fetchRates();
			return;
		}

		const lastDate = new Date(lastUpdateUnix * 1000).toISOString().split('T')[0];
		const nowDate = new Date().toISOString().split('T')[0];

		if (lastDate !== nowDate) await this.fetchRates();
	}

	constructor() {
		makeAutoObservable(this);
		this.updateRates();
	}
}

export const currencyStore = new CurrencyStore();
