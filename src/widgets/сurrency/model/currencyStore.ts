import { makeAutoObservable, reaction } from 'mobx';

import type { IBaseUserPort } from '@/entities/user';
import { createDefaultCurrencies } from '@/shared/lib/constants';
import type { Status } from '@/shared/stores';

import { fetchRates } from '../api';
import { currencyIcons, currencyNames, sortCodesByPopularity } from '../lib';
import type { Currency, CurrencyOption, RatesList, RatesResponse } from '.';

export class CurrencyStore {
	private disposers = new Set<() => void>();
	private inited: boolean = false;
	private status: Status = 'idle';
	private error: string | null = null;

	private rates: RatesResponse | null = null;

	currencies: Currency[] = createDefaultCurrencies();

	get isLoading(): boolean {
		return this.status === 'loading';
	}

	get isReady(): boolean {
		return this.status === 'ready' && this.rates !== null;
	}

	get isError(): boolean {
		return this.status === 'error';
	}

	get errorMessage(): string | null {
		return this.error;
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
		const list = this.ratesList;
		return Object.values(list).map(({ icon, name, code }) => ({ icon, key: name, label: code, value: code }));
	}

	get ratesList(): RatesList {
		if (!this.rates?.rates) return {};

		const codes = Object.keys(this.rates.rates).filter((c) => c !== 'XDR');
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
		return (
			this.currencies.length === createDefaultCurrencies().length &&
			this.currencies.every((c, i) => {
				const def = createDefaultCurrencies()[i];
				if (i === 0) return c.type === def.type && c.code === def.code && c.value === def.value;

				return c.type === def.type && c.code === def.code;
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

		const idx = type === 'base' ? 0 : 1;
		this.updateCurrencies(idx, 'code', selectedCode);
		this.recalcTarget();
	}

	handleCurrencyValue(index: number, amount: number): void {
		const fromIdx = index as 0 | 1;
		const toIdx = fromIdx === 0 ? 1 : 0;

		if (!this.isReady) {
			this.updateCurrencies(fromIdx, 'value', amount);
			return;
		}

		const fromCode = this.currencies[fromIdx].code;
		const toCode = this.currencies[toIdx].code;
		const toValue = this.convertCurrency(amount, fromCode, toCode);

		this.updateCurrencies(fromIdx, 'value', amount);
		this.updateCurrencies(toIdx, 'value', toValue);
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

	private recalcTarget(): void {
		if (!this.isReady) return;

		const base = this.currencies[0];
		const targetCode = this.currencies[1].code;
		const newTarget = this.convertCurrency(base.value, base.code, targetCode);
		this.updateCurrencies(1, 'value', newTarget);
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

	private async fetchRates(): Promise<void> {
		if (!this.userStore?.id || this.isLoading) return;

		this.setLoading();

		try {
			const result = await fetchRates();
			if (result) this.setReady(result);
		} catch (error) {
			this.setError(error);
		}
	}

	private async updateRates(): Promise<void> {
		const last = this.rates?.lastUpdate ?? 0;
		const ageMs = Date.now() - last * 1000;
		const TTL = 12 * 60 * 60 * 1000;

		if (ageMs > TTL) await this.fetchRates();
	}

	constructor(private readonly userStore: IBaseUserPort) {
		makeAutoObservable<this, 'userStore' | 'inited' | 'disposers'>(this, {
			userStore: false,
			inited: false,
			disposers: false,
		});
	}

	init(): void {
		if (this.inited) return;
		this.inited = true;

		this.track(
			reaction(
				() => this.userStore.id,
				(id) => (id ? void this.updateRates() : this.reset()),
				{ fireImmediately: true }
			)
		);
	}

	destroy(): void {
		this.disposers.forEach((dispose) => {
			try {
				dispose();
			} catch {}
		});
		this.disposers.clear();
		this.inited = false;
	}

	private setLoading(): void {
		this.status = 'loading';
		this.error = null;
	}

	private setReady(rates: RatesResponse): void {
		this.status = 'ready';
		this.error = null;
		this.rates = rates;
		this.recalcTarget();
	}

	private setError(error: unknown): void {
		this.status = this.rates ? 'ready' : 'error';
		this.error = error instanceof Error ? error.message : String(error);
	}

	private reset(): void {
		this.status = 'idle';
		this.error = null;
		this.rates = null;
		this.currencies = createDefaultCurrencies();
	}

	private track(disposer?: (() => void) | void): void {
		if (!disposer) return;
		this.disposers.add(disposer);
	}
}
