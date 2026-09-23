import {
	Icon,
	IconActivityHeartbeat,
	IconCalculator,
	IconCalendarWeek,
	IconCloudStorm,
	IconLanguage,
	IconNote,
	IconWorldDollar,
} from '@tabler/icons-react';

interface WidgetConfig {
	id: string;
	title: string;
	icon: Icon;
}

export const WIDGETS = [
	{ id: 'calculator', title: 'Калькулятор', icon: IconCalculator },
	{ id: 'calendar', title: 'Календарь', icon: IconCalendarWeek },
	{ id: 'weather', title: 'Погода', icon: IconCloudStorm },
	{ id: 'notes', title: 'Заметки', icon: IconNote },
	{ id: 'currency', title: 'Конвертер валют', icon: IconWorldDollar },
	{ id: 'translator', title: 'Переводчик', icon: IconLanguage },
	{ id: 'network', title: 'Сеть', icon: IconActivityHeartbeat },
] as const satisfies readonly WidgetConfig[];

export type WidgetId = (typeof WIDGETS)[number]['id'];

export const EMPTY_WIDGET_SLOT = '__empty__' as const;

export type WidgetSlot = WidgetId | typeof EMPTY_WIDGET_SLOT;
