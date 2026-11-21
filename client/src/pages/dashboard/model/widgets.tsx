import type { ReactNode } from 'react';

import type { WidgetId } from '@/entities/user-profile';
import { WIDGETS } from '@/shared/config';
import { Assistant, ASSISTANT_TIP } from '@/widgets/assistant';
import { Calculator, CALCULATOR_TIP } from '@/widgets/calculator';
import { Calendar, CALENDAR_TIP } from '@/widgets/calendar';
import { Cloud, CLOUD_TIP } from '@/widgets/cloud';
import { Credentials, CREDENTIALS_TIP } from '@/widgets/credentials';
import { Currency, CURRENCY_TIP } from '@/widgets/currency';
import { Network, NETWORK_TIP } from '@/widgets/network';
import { Notes, NOTES_TIP } from '@/widgets/notes';
import { Todo, TODO_TIP } from '@/widgets/todo';
import { Translator, TRANSLATOR_TIP } from '@/widgets/translator';
import { Weather, WEATHER_TIP } from '@/widgets/weather';

const dashboardWidgets = {
	assistant: { content: <Assistant />, tip: ASSISTANT_TIP },
	calculator: { content: <Calculator />, tip: CALCULATOR_TIP },
	calendar: { content: <Calendar />, tip: CALENDAR_TIP },
	cloud: { content: <Cloud />, tip: CLOUD_TIP },
	credentials: { content: <Credentials />, tip: CREDENTIALS_TIP },
	currency: { content: <Currency />, tip: CURRENCY_TIP },
	network: { content: <Network />, tip: NETWORK_TIP },
	notes: { content: <Notes />, tip: NOTES_TIP },
	todo: { content: <Todo />, tip: TODO_TIP },
	translator: { content: <Translator />, tip: TRANSLATOR_TIP },
	weather: { content: <Weather />, tip: WEATHER_TIP },
} satisfies Record<WidgetId, { content: ReactNode; tip: ReactNode }>;

export const widgets = WIDGETS.map((widget) => ({ ...widget, ...dashboardWidgets[widget.id] }));
