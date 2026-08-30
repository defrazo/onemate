import CalculatorWidget from '@/widgets/calculator';
import CalendarWidget from '@/widgets/calendar';
import CurrencyWidget from '@/widgets/currency';
import NotesWidget from '@/widgets/notes';
import TranslatorWidget from '@/widgets/translator';
import WeatherWidget from '@/widgets/weather';

export const widgets = [
	{ id: 'calculator', content: <CalculatorWidget /> },
	{ id: 'calendar', content: <CalendarWidget /> },
	{ id: 'weather', content: <WeatherWidget /> },
	{ id: 'notes', content: <NotesWidget /> },
	{ id: 'currency', content: <CurrencyWidget /> },
	{ id: 'translator', content: <TranslatorWidget /> },
];
