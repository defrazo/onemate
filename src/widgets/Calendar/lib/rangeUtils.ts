import {
	differenceInCalendarDays,
	eachDayOfInterval,
	format,
	isAfter,
	isBefore,
	isSameDay,
	isWeekend,
	isWithinInterval,
} from 'date-fns';
import { ru } from 'date-fns/locale';

import { DateRange } from '../model';

export const calculateNewRange = (clickedDate: Date, currentRange: DateRange): [Date, Date | null] => {
	const [start, end] = currentRange;
	if (!start || (start && end)) return [clickedDate, null];

	if (start && !end) {
		if (isSameDay(clickedDate, start)) return [clickedDate, null];

		const earlier = isBefore(clickedDate, start) ? clickedDate : start;
		const later = isAfter(clickedDate, start) ? clickedDate : start;

		return [earlier, later];
	}

	return [clickedDate, null];
};

export const getRangeLength = (range: DateRange, includeWeekends: boolean): number => {
	const [start, end] = range;
	if (!start || !end) return 0;
	if (includeWeekends) return differenceInCalendarDays(end, start) + 1;

	return eachDayOfInterval({ start, end }).filter((d) => !isWeekend(d)).length;
};

export const formatRange = (start: Date, end: Date): string => {
	return `С ${format(start, 'd MMMM', { locale: ru })} по ${format(end, 'd MMMM', { locale: ru })}`;
};

export const isInRange = (date: Date, range: DateRange) => {
	const [start, end] = range;
	if (!start || !end) return false;

	return isWithinInterval(date, { start, end });
};

export const hasWeekendInRange = (range: DateRange): boolean => {
	const [start, end] = range;
	if (!start || !end) return false;

	return eachDayOfInterval({ start, end }).some((date) => isWeekend(date));
};
