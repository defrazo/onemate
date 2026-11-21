import { LS_PREFIX } from '@/shared/config';
import { storage } from '@/shared/lib/storage';

import type { RatesResponse } from '../model/types';

const CACHE_KEY = `${LS_PREFIX}currency_rates`;
const TTL = 12 * 60 * 60 * 1000;

type CurrencyCacheData = {
	rates: RatesResponse;
	cachedAt: number;
};

export const currencyCache = {
	read(): CurrencyCacheData | null {
		try {
			const cached = storage.get(CACHE_KEY);
			if (!cached || typeof cached !== 'object') return null;

			return cached as CurrencyCacheData;
		} catch {
			return null;
		}
	},

	write(rates: RatesResponse) {
		try {
			storage.set(CACHE_KEY, { rates, cachedAt: Date.now() });
		} catch {}
	},

	isFresh(cache: CurrencyCacheData) {
		return Date.now() - cache.cachedAt < TTL;
	},

	clear() {
		try {
			storage.remove(CACHE_KEY);
		} catch {}
	},
};
