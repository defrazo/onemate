import { readCache, writeCache } from '@/shared/lib/cache';

import type { MonitoredService } from '../model';

export type NetworkCacheData = {
	services: MonitoredService[];
	updatedAt: number;
};

export const networkCache = {
	read(userId: string): NetworkCacheData | null {
		const cached = readCache(userId)?.ui?.network;
		if (!cached) return null;

		const data = cached as Partial<NetworkCacheData>;

		if (!Array.isArray(data.services)) return null;

		return { services: data.services, updatedAt: data.updatedAt ?? 0 };
	},

	write(userId: string, services: MonitoredService[]) {
		writeCache(userId, { ui: { network: { services, updatedAt: Date.now() } } });
	},
};
