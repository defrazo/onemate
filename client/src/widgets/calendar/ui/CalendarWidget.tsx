import { Tooltip } from '@/shared/ui';

import { CALENDAR_TIP, useCalendar } from '../model';
import { CalendarControls, CalendarGrid, CalendarNav } from '.';

const CalendarWidget = () => {
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
		<>
			<div className="flex items-center">
				<Tooltip content={CALENDAR_TIP}>
					<h1 className="core-header">Календарь</h1>
				</Tooltip>
			</div>
			<div className="flex size-full flex-col justify-between gap-2">
				<div className="core-border flex flex-1 flex-col gap-2 py-1">
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
		</>
	);
};

export default CalendarWidget;
