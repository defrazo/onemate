import { useEffect, useState } from 'react';
import { addMonths, subMonths } from 'date-fns';

import { calculateNewRange, formatRange, getDateFromDay, getRangeLength, hasWeekendInRange } from '../lib';
import type { DateRange } from '.';

export const useCalendar = () => {
	const [currentDate, setCurrentDate] = useState<Date>(new Date());
	const [includeWeekends, setIncludeWeekends] = useState<boolean>(true);
	const [range, setRange] = useState<DateRange>([null, null]);
	const [rangeState, setRangeState] = useState<string>('');

	const formattedRange = range[0] && range[1] ? formatRange(range[0], range[1]) : '';
	const rangeWithWeekend = getRangeLength(range, includeWeekends);

	const handlePrev = () => setCurrentDate(subMonths(currentDate, 1));
	const handleNext = () => setCurrentDate(addMonths(currentDate, 1));

	const handleDayClick = (day: number) => {
		const clickedDate = getDateFromDay(currentDate, day);
		setRange((prev) => calculateNewRange(clickedDate, prev));
	};

	const getRangeDescription = (): string => {
		const [start, end] = range;
		if (!start || !end) return '\u2800';

		let text = `${formattedRange}: ${rangeWithWeekend} дней`;
		if (hasWeekendInRange(range)) text += includeWeekends ? ' (вкл. выходные)' : ' (без выходных)';

		return text;
	};

	useEffect(() => setRangeState(getRangeDescription()), [range, includeWeekends]);

	return {
		currentDate,
		handleDayClick,
		handleNext,
		handlePrev,
		includeWeekends,
		range,
		rangeState,
		setIncludeWeekends,
		setRange,
	};
};
