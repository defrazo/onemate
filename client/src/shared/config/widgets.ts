import {
	IconActivityHeartbeat,
	IconCalculator,
	IconCalendarWeek,
	IconCloudStorm,
	IconLanguage,
	IconNote,
	IconWorldDollar,
	type TablerIcon,
} from '@tabler/icons-react';

interface WidgetConfig {
	id: string;
	title: string;
	icon: TablerIcon;
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
