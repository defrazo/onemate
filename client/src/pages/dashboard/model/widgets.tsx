import {
	IconCalculator,
	IconCalendarWeek,
	IconCloudStorm,
	IconLanguage,
	IconNote,
	IconWorldDollar,
} from '@tabler/icons-react';

import { Calculator, CALCULATOR_TIP } from '@/widgets/calculator';
import { Calendar, CALENDAR_TIP } from '@/widgets/calendar';
import { CURRENCY_TIP, CurrencyWidget } from '@/widgets/currency';
import { Notes, NOTES_TIP } from '@/widgets/notes';
import { TRANSLATOR_TIP, TranslatorWidget } from '@/widgets/translator';
import { WEATHER_TIP, WeatherWidget } from '@/widgets/weather';

export const widgets = [
	{ id: 'calculator', title: 'Калькулятор', icon: IconCalculator, content: <Calculator />, tip: CALCULATOR_TIP },
	{ id: 'calendar', title: 'Календарь', icon: IconCalendarWeek, content: <Calendar />, tip: CALENDAR_TIP },
	{ id: 'weather', title: 'Погода', icon: IconCloudStorm, content: <WeatherWidget />, tip: WEATHER_TIP },
	{ id: 'notes', title: 'Заметки', icon: IconNote, content: <Notes />, tip: NOTES_TIP },
	{ id: 'currency', title: 'Конвертер валют', icon: IconWorldDollar, content: <CurrencyWidget />, tip: CURRENCY_TIP },
	{ id: 'translator', title: 'Переводчик', icon: IconLanguage, content: <TranslatorWidget />, tip: TRANSLATOR_TIP },
];
