import { IconCalendarStats } from '@tabler/icons-react';

import { useOutsideClick } from '@/shared/lib/hooks';
import { Button, Collapse } from '@/shared/ui';

import { useCalendar } from '../model';
import { Controls, Grid, Navigation } from './components';

export const Calendar = () => {
	const {
		currentMonth,
		range,
		rangeInfo,
		includeWeekends,
		isControlsOpen,
		prevMonth,
		nextMonth,
		selectDay,
		toggleWeekends,
		resetRange,
		setIsControlsOpen,
	} = useCalendar();

	const calendarRef = useOutsideClick<HTMLDivElement>(() => setIsControlsOpen(false));

	return (
		<div ref={calendarRef} className="flex flex-1 flex-col gap-2">
			<Navigation month={currentMonth} onNext={nextMonth} onPrev={prevMonth} />
			<Grid month={currentMonth} range={range} selectDay={selectDay} />
			<Collapse open={!isControlsOpen}>
				<Button
					className="h-8 w-full text-sm"
					leftIcon={<IconCalendarStats className="size-4" />}
					variant="accent"
					onClick={() => setIsControlsOpen(true)}
				>
					Выбрать период
				</Button>
			</Collapse>
			<Collapse className="-mt-2" open={isControlsOpen}>
				<Controls
					includeWeekends={includeWeekends}
					range={range}
					rangeInfo={rangeInfo}
					onReset={resetRange}
					onToggleWeekends={toggleWeekends}
				/>
			</Collapse>
		</div>
	);
};
