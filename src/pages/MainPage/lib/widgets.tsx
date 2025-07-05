import CalculatorWidget from '@/widgets/Calculator';
import CalendarWidget from '@/widgets/Calendar';
import CurrencyWidget from '@/widgets/Currency';
import NotesWidget from '@/widgets/Notes';
import TranslatorWidget from '@/widgets/Translator';
import WeatherWidget from '@/widgets/Weather';

export const widgets = [
	{ id: 'calculator', content: <CalculatorWidget /> },
	{ id: 'calendar', content: <CalendarWidget /> },
	{ id: 'weather', content: <WeatherWidget /> },
	{ id: 'notes', content: <NotesWidget /> },
	{ id: 'currency', content: <CurrencyWidget /> },
	{ id: 'translator', content: <TranslatorWidget /> },
];
