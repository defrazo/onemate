import { action, computed, makeObservable, observable, reaction } from 'mobx';

import type { IBaseUserPort } from '@/entities/user';
import { AsyncStore } from '@/shared/lib/store';
import { formatFixed } from '@/shared/lib/utils';

import { fetchRates } from '../api/fetchRates';
import { currencyCache } from '../lib/currencyCache';
import { currencyIcons } from '../lib/currencyIcons';
import { currencyNames } from '../lib/currencyNames';
import { convertAmount } from '../lib/sum';
import { sortCodesByPopularity } from '../lib/utils';
import { createDefaultCurrencies } from './defaults';
import type { Currency, CurrencyOption, RatesList, RatesResponse } from './types';

export class CurrencyStore extends AsyncStore {
	private initialized = false;
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
			key: code,
			label: name,
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

	get exchangeRate(): string {
		const baseRate = this.ratesList[this.baseCode]?.value ?? 0;
		const targetRate = this.ratesList[this.targetCode]?.value ?? 0;

		const ratio = baseRate > 0 ? targetRate / baseRate : 0;

		const baseName = this.ratesList[this.baseCode]?.name ?? this.baseCode;
		const targetName = this.ratesList[this.targetCode]?.name ?? this.targetCode;

		return `1 ${baseName} = ${formatFixed(ratio, 2)} ${targetName}`;
	}

	get conversionResult(): string {
		return `${formatFixed(this.baseValue, 2)} ${this.baseCode} = ${formatFixed(this.targetValue, 2)} ${this.targetCode}`;
	}

	get isDefault(): boolean {
		const defaults = createDefaultCurrencies();

		return (
			this.currencies.length === defaults.length &&
			this.currencies.every((currency, idx) => {
				const def = defaults[idx];

				if (idx === 0)
					return currency.type === def.type && currency.code === def.code && currency.value === def.value;

				return currency.type === def.type && currency.code === def.code;
			})
		);
	}

	ensureLoaded(): Promise<void> {
		if (this.initialized || this.isLoading) return Promise.resolve();
		return this.loadRates();
	}

	selectCurrency(selectedCode: string, type: 'base' | 'target') {
		const base = this.currencies[0];
		const target = this.currencies[1];

		if ((type === 'base' && selectedCode === target.code) || (type === 'target' && selectedCode === base.code)) {
			this.swapCurrencies();
			return;
		}

		const idx = type === 'base' ? 0 : 1;

		this.updateCurrency(idx, 'code', selectedCode);
		this.recalcTarget();
	}

	setCurrencyValue(idx: 0 | 1, amount: number): void {
		const targetIdx = idx === 0 ? 1 : 0;

		if (!this.isReady) {
			this.updateCurrency(idx, 'value', amount);
			return;
		}

		const fromCode = this.currencies[idx].code;
		const toCode = this.currencies[targetIdx].code;

		const toValue = this.convertCurrency(amount, fromCode, toCode);

		this.updateCurrency(idx, 'value', amount);
		this.updateCurrency(targetIdx, 'value', toValue);
	}

	swapCurrencies(): void {
		const [base, target] = this.currencies;

		this.currencies = [
			{ type: 'base', code: target.code, value: target.value },
			{ type: 'target', code: base.code, value: base.value },
		];
	}

	clear(): void {
		this.currencies = createDefaultCurrencies();
		this.recalcTarget();
	}

	private async loadRates(): Promise<void> {
		const cached = currencyCache.read();

		if (cached) {
			if (!this.isReady) this.applyRates(cached.rates);

			if (currencyCache.isFresh(cached)) {
				this.initialized = true;
				return;
			}
		}

		if (this.isLoading) return;

		await this.withLoading(async () => {
			const rates = await fetchRates();
			if (!rates) throw new Error('Не удалось загрузить курсы валют');

			this.applyRates(rates);
			currencyCache.write(rates);

			this.initialized = true;
		});
	}

	private updateCurrency<K extends keyof Currency>(idx: number, key: K, value: Currency[K]): void {
		const updated = [...this.currencies];
		updated[idx] = { ...updated[idx], [key]: value };
		this.currencies = updated;
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

		this.updateCurrency(1, 'value', value);
	}

	private convertCurrency(amount: number, from: string, to: string): number {
		const result = convertAmount(amount, from, to, this.ratesList);
		return result === null ? 0 : Number(result.toFixed(2));
	}

	constructor(private readonly userStore: IBaseUserPort) {
		super();

		makeObservable<this, 'rates' | 'updateCurrency' | 'applyRates' | 'reset'>(this, {
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
			exchangeRate: computed,
			conversionResult: computed,

			updateCurrency: action,
			setCurrencyValue: action,
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
					if (!id) this.reset();
				}
			)
		);
	}

	protected reset(): void {
		this.initialized = false;
		this.rates = null;
		this.currencies = createDefaultCurrencies();
	}
}
