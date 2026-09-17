import { useState } from 'react';
import { addMonths, subMonths } from 'date-fns';

import { getDateInMonth, getNextRange, getRangeInfo, hasWeekendInRange } from '../lib';
import type { DateRange } from '.';

export const useCalendar = () => {
	const [currentMonth, setCurrentMonth] = useState(new Date());
	const [range, setRange] = useState<DateRange>([null, null]);
	const [includeWeekends, setIncludeWeekends] = useState(false);
	const [isControlsOpen, setIsControlsOpen] = useState(false);

	const rangeInfo = getRangeInfo(range, includeWeekends);

	const prevMonth = () => setCurrentMonth((date) => subMonths(date, 1));
	const nextMonth = () => setCurrentMonth((date) => addMonths(date, 1));

	const selectDay = (day: number) => {
		const date = getDateInMonth(currentMonth, day);
		const nextRange = getNextRange(date, range);

		setRange(nextRange);
		setIncludeWeekends(hasWeekendInRange(nextRange));
		setIsControlsOpen(true);
	};

	const toggleWeekends = () => setIncludeWeekends((value) => !value);

	const resetRange = () => {
		if (!range[0]) {
			setIsControlsOpen(false);
			return;
		}

		setRange([null, null]);
		setIncludeWeekends(false);
	};

	return {
		currentMonth,
		range,
		rangeInfo,
		includeWeekends,
		isControlsOpen,
		selectDay,
		prevMonth,
		nextMonth,
		resetRange,
		toggleWeekends,
		setIsControlsOpen,
	};
};
