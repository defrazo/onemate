import { forwardRef } from 'react';

import { cn } from '@/shared/lib/utils';

import { useCalendar } from '../model';
import { CalendarControls, CalendarGrid, CalendarNav } from '.';

interface CalendarWidgetProps {
	className?: string;
}

const CalendarWidget = forwardRef<HTMLDivElement, CalendarWidgetProps>((props, ref) => {
	const {
		currentDate,
		handleDayClick,
		handleNext,
		handlePrev,
		includeWeekends,
		range,
		rangeState,
		setIncludeWeekends,
		setRange,
	} = useCalendar();

	return (
		<div
			ref={ref}
			{...props}
			className={cn(
				'core-card core-base flex flex-1 flex-col gap-2 shadow-[var(--shadow)] select-none',
				props.className
			)}
		>
			<h1 className="core-header">Календарь</h1>
			<div className="flex size-full flex-col justify-between gap-2">
				<div className="core-border flex h-full flex-col rounded-xl py-2">
					<CalendarNav currentDate={currentDate} handleNext={handleNext} handlePrev={handlePrev} />
					<CalendarGrid currentDate={currentDate} handleDayClick={handleDayClick} range={range} />
				</div>
				<CalendarControls
					includeWeekends={includeWeekends}
					range={range}
					rangeState={rangeState}
					setIncludeWeekends={setIncludeWeekends}
					setRange={setRange}
				/>
			</div>
		</div>
	);
});

export default CalendarWidget;
