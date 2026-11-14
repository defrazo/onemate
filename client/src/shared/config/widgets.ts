import {
	type Icon,
	IconActivityHeartbeat,
	IconCalculator,
	IconCalendarWeek,
	IconCash,
	IconChecks,
	IconCloudPin,
	IconCloudUpload,
	IconKey,
	IconLanguage,
	IconMessageQuestion,
	IconNote,
} from '@tabler/icons-react';

interface WidgetConfig {
	id: string;
	title: string;
	icon: Icon;
}

export const WIDGETS = [
	{ id: 'assistant', title: 'Mate AI', icon: IconMessageQuestion },
	{ id: 'calculator', title: 'Калькулятор', icon: IconCalculator },
	{ id: 'calendar', title: 'Календарь', icon: IconCalendarWeek },
	{ id: 'weather', title: 'Погода', icon: IconCloudPin },
	{ id: 'notes', title: 'Заметки', icon: IconNote },
	{ id: 'credentials', title: 'Аккаунты', icon: IconKey },
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

export const migrateWidgetId = <T>(value: T): T | 'assistant' => (value === 'ask' ? 'assistant' : value);

export const normalizeDashboardLayout = (value: unknown): DashboardLayout => {
	if (!Array.isArray(value) || value.length !== 6) return createDefaultDashboardLayout();

	const slots: unknown[][] = value.every((item) => typeof item === 'string') ? value.map((id) => [id]) : value;
	const used = new Set<string>();
	const result: WidgetId[][] = [];
	const migrating = slots.some((slot) => Array.isArray(slot) && slot.includes('ask'));

	for (const slot of slots) {
		if (!Array.isArray(slot) || slot.length < 1 || slot.length > 2) return createDefaultDashboardLayout();

		const migrated: WidgetId[] = [];

		for (const value of slot) {
			const id = migrateWidgetId(value);

			if (id === 'assistant' && used.has(id) && migrating) continue;

			if (typeof id !== 'string' || !WIDGETS.some((widget) => widget.id === id) || used.has(id)) {
				return createDefaultDashboardLayout();
			}

			used.add(id);
			migrated.push(id as WidgetId);
		}

		result.push(migrated);
	}

	for (const slot of result) {
		if (slot.length) continue;

		const replacement = WIDGETS.find(({ id }) => !used.has(id))!;
		slot.push(replacement.id);
		used.add(replacement.id);
	}

	return result as DashboardLayout;
};

export const EMPTY_WIDGET_SLOT = '__empty__' as const;

export type WidgetSlot = WidgetId | typeof EMPTY_WIDGET_SLOT;

export const normalizeWidgetSlots = (value: unknown): WidgetSlot[] | null | undefined => {
	if (value == null) return value;

	if (!Array.isArray(value)) return undefined;

	const used = new Set<string>();

	return value.map((item) => {
		const id = migrateWidgetId(item);
		if (!WIDGETS.some((widget) => widget.id === id) || used.has(id)) return EMPTY_WIDGET_SLOT;
		used.add(id);
		return id as WidgetId;
	});
};
