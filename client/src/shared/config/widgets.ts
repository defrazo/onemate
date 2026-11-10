import {
	type Icon,
	IconActivityHeartbeat,
	IconCalculator,
	IconCalendarWeek,
	IconCash,
	IconChecks,
	IconCloudPin,
	IconCloudUpload,
	IconLanguage,
	IconNote,
} from '@tabler/icons-react';

interface WidgetConfig {
	id: string;
	title: string;
	icon: Icon;
}

export const WIDGETS = [
	{ id: 'calculator', title: 'Калькулятор', icon: IconCalculator },
	{ id: 'calendar', title: 'Календарь', icon: IconCalendarWeek },
	{ id: 'weather', title: 'Погода', icon: IconCloudPin },
	{ id: 'notes', title: 'Заметки', icon: IconNote },
	{ id: 'currency', title: 'Конвертер валют', icon: IconCash },
	{ id: 'translator', title: 'Переводчик', icon: IconLanguage },
	{ id: 'network', title: 'Сеть', icon: IconActivityHeartbeat },
	{ id: 'cloud', title: 'Облако', icon: IconCloudUpload },
	{ id: 'todo', title: 'Задачи', icon: IconChecks },
] as const satisfies readonly WidgetConfig[];

export type WidgetId = (typeof WIDGETS)[number]['id'];

export type DashboardSlot = [WidgetId] | [WidgetId, WidgetId];
export type DashboardLayout = DashboardSlot[];

const DEFAULT_DASHBOARD_WIDGETS: WidgetId[] = ['cloud', 'calendar', 'notes', 'currency', 'weather', 'todo'];

export const createDefaultDashboardLayout = (): DashboardLayout => DEFAULT_DASHBOARD_WIDGETS.map((id) => [id]);

export const normalizeDashboardLayout = (value: unknown): DashboardLayout => {
	if (!Array.isArray(value) || value.length !== 6) return createDefaultDashboardLayout();

	const slots: unknown[][] = value.every((item) => typeof item === 'string') ? value.map((id) => [id]) : value;
	const used = new Set<string>();
	const result: DashboardLayout = [];

	for (const slot of slots) {
		if (!Array.isArray(slot) || slot.length < 1 || slot.length > 2) return createDefaultDashboardLayout();

		for (const id of slot) {
			if (typeof id !== 'string' || !WIDGETS.some((widget) => widget.id === id) || used.has(id)) {
				return createDefaultDashboardLayout();
			}
			used.add(id);
		}

		result.push([...slot] as DashboardSlot);
	}

	return result;
};

export const EMPTY_WIDGET_SLOT = '__empty__' as const;

export type WidgetSlot = WidgetId | typeof EMPTY_WIDGET_SLOT;
