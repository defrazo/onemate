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
import { Currency, CURRENCY_TIP } from '@/widgets/currency';
import { Notes, NOTES_TIP } from '@/widgets/notes';
import { Translator, TRANSLATOR_TIP } from '@/widgets/translator';
import { Weather, WEATHER_TIP } from '@/widgets/weather';

export const widgets = [
	{ id: 'calculator', title: 'Калькулятор', icon: IconCalculator, content: <Calculator />, tip: CALCULATOR_TIP },
	{ id: 'calendar', title: 'Календарь', icon: IconCalendarWeek, content: <Calendar />, tip: CALENDAR_TIP },
	{ id: 'weather', title: 'Погода', icon: IconCloudStorm, content: <Weather />, tip: WEATHER_TIP },
	{ id: 'notes', title: 'Заметки', icon: IconNote, content: <Notes />, tip: NOTES_TIP },
	{ id: 'currency', title: 'Конвертер валют', icon: IconWorldDollar, content: <Currency />, tip: CURRENCY_TIP },
	{ id: 'translator', title: 'Переводчик', icon: IconLanguage, content: <Translator />, tip: TRANSLATOR_TIP },
];
