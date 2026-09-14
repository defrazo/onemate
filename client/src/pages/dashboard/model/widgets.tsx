import {
	IconCalculator,
	IconCalendarWeek,
	IconCloudStorm,
	IconLanguage,
	IconNote,
	IconWorldDollar,
} from '@tabler/icons-react';

import { CALCULATOR_TIP, CalculatorWidget } from '@/widgets/calculator';
import { CALENDAR_TIP, CalendarWidget } from '@/widgets/calendar';
import { CURRENCY_TIP, CurrencyWidget } from '@/widgets/currency';
import { NOTES_TIP, NotesWidget } from '@/widgets/notes';
import { TRANSLATOR_TIP, TranslatorWidget } from '@/widgets/translator';
import { WEATHER_TIP, WeatherWidget } from '@/widgets/weather';

export const widgets = [
	{
		id: 'calculator',
		title: 'Калькулятор',
		icon: IconCalculator,
		content: <CalculatorWidget />,
		tip: CALCULATOR_TIP,
	},
	{
		id: 'calendar',
		title: 'Календарь',
		icon: IconCalendarWeek,
		content: <CalendarWidget />,
		tip: CALENDAR_TIP,
	},
	{ id: 'weather', title: 'Погода', icon: IconCloudStorm, content: <WeatherWidget />, tip: WEATHER_TIP },
	{ id: 'notes', title: 'Заметки', icon: IconNote, content: <NotesWidget />, tip: NOTES_TIP },
	{ id: 'currency', title: 'Конвертер валют', icon: IconWorldDollar, content: <CurrencyWidget />, tip: CURRENCY_TIP },
	{ id: 'translator', title: 'Переводчик', icon: IconLanguage, content: <TranslatorWidget />, tip: TRANSLATOR_TIP },
];
