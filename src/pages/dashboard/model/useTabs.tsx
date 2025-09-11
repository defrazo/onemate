import { useCallback, useEffect, useMemo, useState } from 'react';

import { Calculator, Calendar, Notes, Translator, Wallet, Weather } from '@/shared/assets/icons/slider-home';
import type { TabOption } from '@/shared/ui';

export const useTabs = () => {
	const [tabTop, setTabTop] = useState<string>('calendar');
	const [tabBottom, setTabBottom] = useState<string>('weather');

	const tabs: TabOption[] = [
		{ value: 'calculator', label: <Calculator /> },
		{ value: 'calendar', label: <Calendar /> },
		{ value: 'notes', label: <Notes /> },
		{ value: 'currency', label: <Wallet /> },
		{ value: 'weather', label: <Weather /> },
		{ value: 'translator', label: <Translator /> },
	];

	const indexByValue = useMemo(() => new Map(tabs.map((t, i) => [t.value, i] as const)), [tabs]);

	const nextOf = useCallback(
		(value: string) => {
			const idx = indexByValue.get(value) ?? 0;
			const nextIdx = (idx + 1) % tabs.length;
			return tabs[nextIdx].value;
		},
		[indexByValue, tabs]
	);

	const handleTopChange = (value: string) => {
		setTabTop(value);
		setTabBottom(nextOf(value));
	};

	const handleBottomChange = (value: string) => {
		setTabBottom(value);
	};

	useEffect(() => {
		if (tabBottom === tabTop) setTabBottom(nextOf(tabTop));
	}, [tabTop, tabBottom, nextOf]);

	const tabsTop = useMemo<TabOption[]>(() => tabs, [tabs]);

	const tabsBottom = useMemo<TabOption[]>(
		() => tabs.map((tab) => ({ ...tab, disabled: tab.value === tabTop })),
		[tabs, tabTop]
	);

	return { tabTop, tabsTop, tabBottom, tabsBottom, handleTopChange, handleBottomChange };
};
