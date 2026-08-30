import { storage } from '@/shared/lib/storage';

import { cacheKey, cleanupCache } from '../lib';
import type { Cache, CachePatch } from '../model';

export const readCache = (id: string): Cache | null => {
	return storage.get(cacheKey(id)) as Cache | null;
};

export const writeCache = (id: string, patch: CachePatch): void => {
	const prev = readCache(id) ?? { ts: 0 };

	const merged = cleanupCache({
		ts: Date.now(),
		ui: { ...(prev.ui ?? {}), ...(patch.ui ?? {}) },
		auth: { ...(prev.auth ?? {}), ...(patch.auth ?? {}) },
	});

	storage.set(cacheKey(id), merged);
};

export const clearCache = (id: string): void => {
	storage.remove(cacheKey(id));
};
