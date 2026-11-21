import { EMPTY_WIDGET_SLOT, WIDGETS } from '@/shared/config';

import { createDefaultDashboardLayout } from './defaults';

export type WidgetId = (typeof WIDGETS)[number]['id'];
export type WidgetSlot = WidgetId | typeof EMPTY_WIDGET_SLOT;
export type DashboardSlot = [WidgetId] | [WidgetId, WidgetId];
export type DashboardLayout = DashboardSlot[];

const isWidgetId = (value: unknown): value is WidgetId =>
	typeof value === 'string' && WIDGETS.some(({ id }) => id === value);

export const normalizeDashboardLayout = (value: unknown): DashboardLayout => {
	if (!Array.isArray(value) || value.length !== 6) return createDefaultDashboardLayout();

	const used = new Set<WidgetId>();
	const result: DashboardLayout = [];

	for (const slot of value) {
		if (!Array.isArray(slot) || slot.length < 1 || slot.length > 2) return createDefaultDashboardLayout();

		if (!slot.every(isWidgetId)) return createDefaultDashboardLayout();

		const widgets = slot as DashboardSlot;
		if (widgets.some((id) => used.has(id))) return createDefaultDashboardLayout();

		widgets.forEach((id) => used.add(id));
		result.push([...widgets] as DashboardSlot);
	}

	return result;
};

export const normalizeWidgetSlots = (value: unknown): WidgetSlot[] | null | undefined => {
	if (value == null) return value;
	if (!Array.isArray(value)) return undefined;

	const used = new Set<WidgetId>();

	return value.map((item): WidgetSlot => {
		if (!isWidgetId(item) || used.has(item)) return EMPTY_WIDGET_SLOT;

		used.add(item);
		return item;
	});
};

export const normalizeMobileWidgets = (value: unknown): WidgetId[] | null => {
	if (!Array.isArray(value)) return null;

	const selected = new Set(value.filter(isWidgetId));
	const ids = WIDGETS.filter(({ id }) => selected.has(id)).map(({ id }) => id);

	return ids.length ? ids : null;
};
