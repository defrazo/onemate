import { migrateWidgetId, WIDGETS } from '@/shared/config';
import { storage } from '@/shared/lib/storage';

import { cacheKey, cleanupCache } from '../lib/utils';
import type { Cache, CachePatch } from '../model/types';

export const readCache = (id: string): Cache | null => {
	try {
		const value: unknown = storage.get(cacheKey(id));
		if (!value || typeof value !== 'object' || Array.isArray(value)) return null;

		const data = value as Record<string, unknown>;
		const ui = data.ui;

		return {
			ts: typeof data.ts === 'number' && Number.isFinite(data.ts) ? data.ts : 0,
			...(ui && typeof ui === 'object' && !Array.isArray(ui) ? { ui: ui as Cache['ui'] } : {}),
		};
	} catch {
		return null;
	}
};

export const writeCache = (id: string, patch: CachePatch) => {
	const prev = readCache(id) ?? { ts: 0 };

	const merged = cleanupCache({
		ts: Date.now(),
		ui: { ...(prev.ui ?? {}), ...(patch.ui ?? {}) },
	});

	try {
		storage.set(cacheKey(id), merged);
	} catch {}
};

export const clearCache = (id: string) => {
	const cached = readCache(id);
	const selected = cached?.ui?.dashboardActiveWidgets;
	const notes = cached?.ui?.notes;
	const pending = cached?.ui?.profile_pending;

	const legacyProfile = Object.fromEntries(
		['avatar_url', 'widgets_sequence', 'widgets_slots']
			.filter((field) => cached?.ui?.[field] !== undefined)
			.map((field) => [field, cached!.ui![field]])
	);

	const choices =
		selected && typeof selected === 'object' && !Array.isArray(selected)
			? Object.fromEntries(
					Object.entries(selected)
						.map(([slot, widget]) => [migrateWidgetId(slot), migrateWidgetId(widget)])
						.filter(
							([slot, widget]) =>
								WIDGETS.some(({ id }) => id === slot) && WIDGETS.some(({ id }) => id === widget)
						)
				)
			: {};

	const ui = {
		...legacyProfile,
		...(Object.keys(choices).length && { dashboardActiveWidgets: choices }),
		...(notes && typeof notes === 'object' && 'dirty' in notes && notes.dirty === true ? { notes } : {}),
		...(pending && typeof pending === 'object' && !Array.isArray(pending) && Object.keys(pending).length
			? { profile_pending: pending }
			: {}),
	};
	try {
		if (Object.keys(ui).length) storage.set(cacheKey(id), { ts: Date.now(), ui });
		else storage.remove(cacheKey(id));
	} catch {}
};
