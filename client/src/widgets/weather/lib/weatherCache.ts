import { readCache, writeCache } from '@/shared/lib/cache';

import type { CurrentType, ForecastType } from '../model';

export type WeatherCacheData = {
	current: CurrentType;
	forecast: ForecastType[];
	ts: number;
};

export const weatherCache = {
	read(userId: string): WeatherCacheData | null {
		const weather = readCache(userId)?.ui?.weather;

		if (!weather) return null;

		return weather as WeatherCacheData;
	},

	write(userId: string, current: CurrentType, forecast: ForecastType[]): void {
		writeCache(userId, {
			ui: {
				weather: {
					current,
					forecast,
					ts: Date.now(),
				},
			},
		});
	},
};
