import { action, computed, makeObservable, observable, reaction } from 'mobx';

import type { IBaseUserPort } from '@/entities/user';
import { AsyncStore } from '@/shared/lib/store';

import { fetchRates } from '../api';
import { currencyCache, currencyIcons, currencyNames, sortCodesByPopularity } from '../lib';
import { createDefaultCurrencies, type Currency, type CurrencyOption, type RatesList, type RatesResponse } from '.';

export class CurrencyStore extends AsyncStore {
	private rates: RatesResponse | null = null;

	currencies: Currency[] = createDefaultCurrencies();

	get isReady(): boolean {
		return this.rates !== null;
	}

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
		return Object.values(this.ratesList).map(({ icon, name, code }) => ({
			icon,
			key: name,
			label: code,
			value: code,
		}));
	}

	get ratesList(): RatesList {
		if (!this.rates?.rates) return {};

		const codes = Object.keys(this.rates.rates).filter((code) => code !== 'XDR');
		if (!codes.includes('RUB')) codes.push('RUB');

		const ordered = sortCodesByPopularity(codes);

		return ordered.reduce((acc, code) => {
			acc[code] = {
				code,
				icon: currencyIcons[code],
				name: currencyNames[code] ?? code,
				value: this.rates!.rates[code] ?? (code === 'RUB' ? 1 : 0),
			};

			return acc;
		}, {} as RatesList);
	}

	get isDefault(): boolean {
		const defaults = createDefaultCurrencies();

		return (
			this.currencies.length === defaults.length &&
			this.currencies.every((currency, index) => {
				const def = defaults[index];

				if (index === 0)
					return currency.type === def.type && currency.code === def.code && currency.value === def.value;

				return currency.type === def.type && currency.code === def.code;
			})
		);
	}

	updateCurrencies<K extends keyof Currency>(index: number, key: K, value: Currency[K]): void {
		const updated = [...this.currencies];
		updated[index] = { ...updated[index], [key]: value };
		this.currencies = updated;
	}

	selectCurrency(selectedCode: string, type: 'base' | 'target'): void {
		const base = this.currencies[0];
		const target = this.currencies[1];

		if ((type === 'base' && selectedCode === target.code) || (type === 'target' && selectedCode === base.code)) {
			this.swapCurrencies();
			return;
		}

		const index = type === 'base' ? 0 : 1;

		this.updateCurrencies(index, 'code', selectedCode);
		this.recalcTarget();
	}

	handleCurrencyValue(index: number, amount: number): void {
		const fromIndex = index as 0 | 1;
		const toIndex = fromIndex === 0 ? 1 : 0;

		if (!this.isReady) {
			this.updateCurrencies(fromIndex, 'value', amount);
			return;
		}

		const fromCode = this.currencies[fromIndex].code;
		const toCode = this.currencies[toIndex].code;

		const toValue = this.convertCurrency(amount, fromCode, toCode);

		this.updateCurrencies(fromIndex, 'value', amount);
		this.updateCurrencies(toIndex, 'value', toValue);
	}

	swapCurrencies(): void {
		const [base, target] = this.currencies;

		const newBase = { ...base, code: target.code };

		const newTarget = {
			type: 'target' as const,
			code: base.code,
			value: this.convertCurrency(newBase.value, newBase.code, base.code),
		};

		this.currencies = [newBase, newTarget];
	}

	clear(): void {
		this.currencies = createDefaultCurrencies();
		this.recalcTarget();
	}

	private async loadRates(): Promise<void> {
		const cached = currencyCache.read();

		if (cached) {
			this.applyRates(cached.rates);

			if (currencyCache.isFresh(cached)) return;
		}

		if (this.isLoading) return;

		await this.withLoading(async () => {
			const rates = await fetchRates();

			if (!rates) return;

			this.applyRates(rates);
			currencyCache.write(rates);
		});
	}

	private applyRates(rates: RatesResponse): void {
		this.rates = rates;
		this.recalcTarget();
	}

	private recalcTarget(): void {
		if (!this.isReady) return;

		const base = this.currencies[0];
		const targetCode = this.currencies[1].code;

		const value = this.convertCurrency(base.value, base.code, targetCode);

		this.updateCurrencies(1, 'value', value);
	}

	private getRate(code: string): number {
		if (!this.rates?.rates) return code === 'RUB' ? 1 : 0;
		return this.rates.rates[code] ?? (code === 'RUB' ? 1 : 0);
	}

	private convertCurrency(amount: number, from: string, to: string): number {
		const fromRate = this.getRate(from);
		const toRate = this.getRate(to);

		if (!Number.isFinite(amount) || fromRate <= 0 || toRate <= 0) return 0;

		return Number((amount * (toRate / fromRate)).toFixed(2));
	}

	constructor(private readonly userStore: IBaseUserPort) {
		super();

		makeObservable<this, 'rates' | 'applyRates' | 'reset'>(this, {
			rates: observable,
			currencies: observable,

			isReady: computed,
			baseCode: computed,
			targetCode: computed,
			baseValue: computed,
			targetValue: computed,
			currencyOptions: computed,
			ratesList: computed,
			isDefault: computed,

			updateCurrencies: action,
			swapCurrencies: action,
			clear: action,
			applyRates: action,
			reset: action,
		});
	}

	init(): void {
		if (this.inited) return;
		this.inited = true;

		this.track(
			reaction(
				() => this.userStore.id,
				(id) => {
					if (!id) {
						this.reset();
						return;
					}

					void this.loadRates();
				},
				{ fireImmediately: true }
			)
		);
	}

	protected reset(): void {
		this.rates = null;
		this.currencies = createDefaultCurrencies();
	}
}
