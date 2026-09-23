import type { ReactNode } from 'react';

import { type WidgetId, WIDGETS } from '@/shared/config';
import { Calculator, CALCULATOR_TIP } from '@/widgets/calculator';
import { Calendar, CALENDAR_TIP } from '@/widgets/calendar';
import { Currency, CURRENCY_TIP } from '@/widgets/currency';
import { Network, NETWORK_TIP } from '@/widgets/network';
import { Notes, NOTES_TIP } from '@/widgets/notes';
import { Translator, TRANSLATOR_TIP } from '@/widgets/translator';
import { Weather, WEATHER_TIP } from '@/widgets/weather';

const dashboardWidgets = {
	calculator: { content: <Calculator />, tip: CALCULATOR_TIP },
	calendar: { content: <Calendar />, tip: CALENDAR_TIP },
	weather: { content: <Weather />, tip: WEATHER_TIP },
	notes: { content: <Notes />, tip: NOTES_TIP },
	currency: { content: <Currency />, tip: CURRENCY_TIP },
	translator: { content: <Translator />, tip: TRANSLATOR_TIP },
	network: { content: <Network />, tip: NETWORK_TIP },
} satisfies Record<WidgetId, { content: ReactNode; tip: ReactNode }>;

export const widgets = WIDGETS.map((widget) => ({ ...widget, ...dashboardWidgets[widget.id] }));
