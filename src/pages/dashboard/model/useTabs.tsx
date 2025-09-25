import { useState } from 'react';

import { Calculator, Calendar, Notes, Translator, Currency, Weather } from '@/shared/assets/icons/slider-home';
import type { TabOption } from '@/shared/ui';

import type { SlotKey } from '.';

const EMPTY = '__empty__';

export const useTabs = () => {
	const tabs: TabOption[] = [
		{ value: 'calculator', label: <Calculator /> },
		{ value: 'calendar', label: <Calendar /> },
		{ value: 'notes', label: <Notes /> },
		{ value: 'currency', label: <Currency /> },
		{ value: 'weather', label: <Weather /> },
		{ value: 'translator', label: <Translator /> },
	];

	const [slots, setSlots] = useState<Record<SlotKey, string>>({
		topL: 'calendar',
		topR: 'notes',
		botL: 'weather',
		botR: 'translator',
	});

	const tabsFor = (_key: SlotKey): TabOption[] => tabs;

	const setSlot = (key: SlotKey, value: string) => {
		setSlots((prev) => {
			const draft: Record<SlotKey, string> = { ...prev };

			(Object.keys(draft) as SlotKey[]).forEach((k) => {
				if (k !== key && draft[k] === value) draft[k] = EMPTY;
			});

			draft[key] = value;
			return draft;
		});
	};

	return { tabs, slots, setSlot, tabsFor, EMPTY };
};
