import { LS_PREFIX } from '@/shared/config';

import type { Cache, CacheSection } from '../model';

export const cacheKey = (id: string): string => `${LS_PREFIX}cache_${id}`;

const cleanupSection = (section?: CacheSection): CacheSection | undefined => {
	if (!section) return undefined;

	const entries = Object.entries(section).filter(([, value]) => value !== undefined);
	return entries.length ? Object.fromEntries(entries) : undefined;
};

export const cleanupCache = (cache: Cache): Cache => {
	const ui = cleanupSection(cache.ui);
	const auth = cleanupSection(cache.auth);

	return { ts: cache.ts, ...(ui && { ui }), ...(auth && { auth }) };
};
