import { WIDGETS } from '@/shared/config';
import { storage } from '@/shared/lib/storage';

import { cacheKey, cleanupCache } from '../lib/utils';
import type { Cache, CachePatch } from '../model/types';

export const readCache = (id: string): Cache | null => {
	return storage.get(cacheKey(id)) as Cache | null;
};

export const writeCache = (id: string, patch: CachePatch) => {
	const prev = readCache(id) ?? { ts: 0 };

	const merged = cleanupCache({
		ts: Date.now(),
		ui: { ...(prev.ui ?? {}), ...(patch.ui ?? {}) },
		auth: { ...(prev.auth ?? {}), ...(patch.auth ?? {}) },
	});

	storage.set(cacheKey(id), merged);
};

export const clearCache = (id: string) => {
	const selected = readCache(id)?.ui?.dashboardActiveWidgets;

	const choices =
		selected && typeof selected === 'object' && !Array.isArray(selected)
			? Object.fromEntries(
					Object.entries(selected).filter(
						([slot, widget]) =>
							WIDGETS.some(({ id }) => id === slot) && WIDGETS.some(({ id }) => id === widget)
					)
				)
			: {};

	storage.remove(cacheKey(id));

	if (Object.keys(choices).length) {
		try {
			storage.set(cacheKey(id), { ts: Date.now(), ui: { dashboardActiveWidgets: choices } });
		} catch {}
	}
};
