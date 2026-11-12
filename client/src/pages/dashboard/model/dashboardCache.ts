import type { WidgetId } from '@/shared/config';
import { readCache, writeCache } from '@/shared/lib/cache';

export type ActiveWidgets = Partial<Record<WidgetId, WidgetId>>;

export const normalizeActiveWidgets = (layout: readonly (readonly WidgetId[])[], value: unknown): ActiveWidgets => {
	const saved = value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : {};

	return Object.fromEntries(
		layout.flatMap((slot) => {
			const key = slot[0];
			if (!key) return [];

			const selected = saved[key];
			return [[key, slot.find((id) => id === selected) ?? key]];
		})
	);
};

export const readActiveWidgets = (userId: string | null): unknown => {
	try {
		return userId ? readCache(userId)?.ui?.dashboardActiveWidgets : {};
	} catch {
		return {};
	}
};

export const saveActiveWidgets = (userId: string, value: ActiveWidgets) => {
	try {
		if (JSON.stringify(readActiveWidgets(userId)) !== JSON.stringify(value))
			writeCache(userId, { ui: { dashboardActiveWidgets: value } });
	} catch {}
};
