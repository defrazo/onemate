import { differenceInCalendarDays, isBefore, isSameDay, isWeekend, isWithinInterval } from 'date-fns';

import type { DateRange } from '../model/types';
import { getDaysUntil } from './calculation';

export const getNextRange = (date: Date, range: DateRange): DateRange => {
	const [start, end] = range;

	if (!start || end) return [date, null];
	if (isSameDay(date, start)) return [null, null];

	return isBefore(date, start) ? [date, start] : [start, date];
};

export const getRangeLength = (
	range: DateRange,
	includeWeekends: boolean,
	isWorkingDay?: (date: Date) => boolean
): number => {
	const [start, end] = range;

	if (!start || !end) return 0;
	if (includeWeekends) return differenceInCalendarDays(end, start) + 1;

	const days = getDaysUntil(start, end, false, isWorkingDay);
	const firstDay = isWorkingDay ? Number(isWorkingDay(start)) : Number(!isWeekend(start));

	return days + firstDay;
};

export const isInRange = (date: Date, range: DateRange): boolean => {
	const [start, end] = range;
	if (!start || !end) return false;

	return isWithinInterval(date, { start, end });
};
