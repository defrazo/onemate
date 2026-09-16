import { action, computed, makeObservable, observable, reaction } from 'mobx';

import type { IBaseUserPort } from '@/entities/user';
import { AsyncStore } from '@/shared/lib/store';
import { formatFixed } from '@/shared/lib/utils';

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
			this.currencies.every((currency, index) => {
				const def = defaults[index];

				if (index === 0)
					return currency.type === def.type && currency.code === def.code && currency.value === def.value;

				return currency.type === def.type && currency.code === def.code;
			})
		);
	}

	selectCurrency(selectedCode: string, type: 'base' | 'target'): void {
		const base = this.currencies[0];
		const target = this.currencies[1];

		if ((type === 'base' && selectedCode === target.code) || (type === 'target' && selectedCode === base.code)) {
			this.swapCurrencies();
			return;
		}

		const index = type === 'base' ? 0 : 1;

		this.updateCurrency(index, 'code', selectedCode);
		this.recalcTarget();
	}

	setCurrencyValue(index: 0 | 1, amount: number): void {
		const targetIndex = index === 0 ? 1 : 0;

		if (!this.isReady) {
			this.updateCurrency(index, 'value', amount);
			return;
		}

		const fromCode = this.currencies[index].code;
		const toCode = this.currencies[targetIndex].code;

		const toValue = this.convertCurrency(amount, fromCode, toCode);

		this.updateCurrency(index, 'value', amount);
		this.updateCurrency(targetIndex, 'value', toValue);
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

	private updateCurrency<K extends keyof Currency>(index: number, key: K, value: Currency[K]): void {
		const updated = [...this.currencies];
		updated[index] = { ...updated[index], [key]: value };
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
