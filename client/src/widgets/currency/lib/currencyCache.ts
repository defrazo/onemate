import { LS_PREFIX } from '@/shared/config';
import { storage } from '@/shared/lib/storage';

import type { RatesResponse } from '../model';

const CACHE_KEY = `${LS_PREFIX}currency_rates`;
const TTL = 12 * 60 * 60 * 1000;

export type CurrencyCacheData = {
	rates: RatesResponse;
	cachedAt: number;
};

export const currencyCache = {
	read(): CurrencyCacheData | null {
		const cached = storage.get(CACHE_KEY);

		if (!cached || typeof cached !== 'object') {
			return null;
		}

		return cached as CurrencyCacheData;
	},

	write(rates: RatesResponse): void {
		storage.set(CACHE_KEY, {
			rates,
			cachedAt: Date.now(),
		});
	},

	isFresh(cache: CurrencyCacheData): boolean {
		return Date.now() - cache.cachedAt < TTL;
	},

	clear(): void {
		storage.remove(CACHE_KEY);
	},
};
