import { useCalendar } from '../model';
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
		<div className="core-card core-base flex h-full flex-col gap-2 shadow-[var(--shadow)] select-none">
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
};

export default CalendarWidget;
