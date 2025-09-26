import { Calculator, Calendar, Notes, Translator, Currency, Weather } from '@/shared/assets/icons/slider';
import type { TabOption } from '@/shared/ui';

import { useStore } from '@/app/providers';

const EMPTY = '__empty__';

export const useTabs = () => {
	const { userProfileStore: store } = useStore();
	const tabs: TabOption[] = [
		{ value: 'calculator', label: <Calculator /> },
		{ value: 'calendar', label: <Calendar /> },
		{ value: 'notes', label: <Notes /> },
		{ value: 'currency', label: <Currency /> },
		{ value: 'weather', label: <Weather /> },
		{ value: 'translator', label: <Translator /> },
	];

	const slots = store.slots;
	const tabsFor = () => tabs;

	const setSlot = (index: number, value: string) => {
		const newSlots = [...slots];

		const conflictIdx = newSlots.indexOf(value);
		if (conflictIdx !== -1 && conflictIdx !== index) newSlots[conflictIdx] = EMPTY;

		newSlots[index] = value;
		store.updateWidgetSlots(newSlots);
	};

	return { slots, setSlot, tabsFor, EMPTY };
};
