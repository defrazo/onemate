import CalculatorWidget from '@/widgets/calculator';
import NotesWidget from '@/widgets/notes';
import TranslatorWidget from '@/widgets/translator';
import WeatherWidget from '@/widgets/weather';
import CalendarWidget from '@/widgets/сalendar';
import CurrencyWidget from '@/widgets/сurrency';

export const widgets = [
	{ id: 'calculator', content: <CalculatorWidget /> },
	{ id: 'calendar', content: <CalendarWidget /> },
	{ id: 'weather', content: <WeatherWidget /> },
	{ id: 'notes', content: <NotesWidget /> },
	{ id: 'currency', content: <CurrencyWidget /> },
	{ id: 'translator', content: <TranslatorWidget /> },
];
