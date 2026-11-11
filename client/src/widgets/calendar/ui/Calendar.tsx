import { useEffect, useRef } from 'react';
import { observer } from 'mobx-react-lite';

import { useStore } from '@/app/providers';
import { useOutsideClick } from '@/shared/lib/hooks';
import { Collapse } from '@/shared/ui';

import { Controls, Grid, Navigation } from './components';

export const Calendar = observer(() => {
	const { calendarStore, notifyStore } = useStore();

	const calendarRef = useOutsideClick<HTMLDivElement>(calendarStore.closeControls, '[data-widget]');

	const lastErrorCount = useRef(calendarStore.productionErrorCount);
	const errorCount = calendarStore.productionErrorCount;

	useEffect(() => {
		if (errorCount <= lastErrorCount.current) return;

		lastErrorCount.current = errorCount;

		notifyStore.setNotice('Не удалось загрузить производственный календарь', 'error');
	}, [errorCount, notifyStore]);

	return (
		<div ref={calendarRef} className="-mt-2 flex min-h-0 min-w-0 flex-1 flex-col gap-2">
			<Navigation />
			<Grid />

			<Collapse className="-mt-2" open={calendarStore.isControlsOpen}>
				<Controls />
			</Collapse>
		</div>
	);
});
