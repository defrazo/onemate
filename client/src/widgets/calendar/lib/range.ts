import {
	differenceInCalendarDays,
	eachDayOfInterval,
	format,
	isBefore,
	isSameDay,
	isWeekend,
	isWithinInterval,
} from 'date-fns';
import { ru } from 'date-fns/locale';

import { pluralize } from '@/shared/lib/utils';

import type { DateRange, RangeInfo } from '../model';

export const getRangeInfo = (range: DateRange, includeWeekends: boolean): RangeInfo | null => {
	const [start, end] = range;

	if (!start || !end) return null;

	const label = formatRange(start, end);
	const days = getRangeLength(range, includeWeekends);
	const hasWeekends = hasWeekendInRange(range);

	const dayLabel = pluralize(days, 'день', 'дня', 'дней');
	const weekendLabel = hasWeekends ? (includeWeekends ? 'с выходными' : 'без выходных') : null;

	const copyText = `${label}: ${days} ${dayLabel}` + (weekendLabel ? ` (${weekendLabel})` : '');

	return { label, days, hasWeekends, weekendLabel, copyText };
};

export const getNextRange = (date: Date, range: DateRange): DateRange => {
	const [start, end] = range;

	if (!start || end) return [date, null];
	if (isSameDay(date, start)) return [null, null];

	return isBefore(date, start) ? [date, start] : [start, date];
};

export const getRangeLength = (range: DateRange, includeWeekends: boolean) => {
	const [start, end] = range;

	if (!start || !end) return 0;
	if (includeWeekends) return differenceInCalendarDays(end, start) + 1;

	return eachDayOfInterval({ start, end }).filter((d) => !isWeekend(d)).length;
};

export const formatRange = (start: Date, end: Date) => {
	const sameYear = start.getFullYear() === end.getFullYear();
	const sameMonth = sameYear && start.getMonth() === end.getMonth();

	if (sameMonth) return `С ${format(start, 'd', { locale: ru })} по ${format(end, 'd MMMM', { locale: ru })}`;

	if (sameYear) return `С ${format(start, 'd MMMM', { locale: ru })} по ${format(end, 'd MMMM', { locale: ru })}`;

	return `С ${format(start, 'd MMMM yyyy', { locale: ru })} по ${format(end, 'd MMMM yyyy', { locale: ru })}`;
};

export const isInRange = (date: Date, range: DateRange) => {
	const [start, end] = range;

	if (!start || !end) return false;

	return isWithinInterval(date, { start, end });
};

export const hasWeekendInRange = (range: DateRange) => {
	const [start, end] = range;

	if (!start || !end) return false;

	return eachDayOfInterval({ start, end }).some((date) => isWeekend(date));
};
