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

export const EMPTY_WIDGET_SLOT = '__empty__' as const;
