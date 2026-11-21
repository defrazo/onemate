import { differenceInCalendarDays, format } from 'date-fns';
import { ru } from 'date-fns/locale';

import { pluralize } from '@/shared/lib/utils';

import type { CalendarMode, CalendarState } from '../model/types';
import { getDaysUntil, parseDayCount } from './calculation';
import { getRangeLength } from './range';

export type CalendarResult = {
	prefix: string;
	value: string;
	suffix?: string;
};

const formatDays = (days: number): string => `${days} ${pluralize(days, 'день', 'дня', 'дней')}`;

export const formatCalculationDate = (date: Date): string => format(date, 'd MMMM yyyy г.', { locale: ru });

export const formatCalendarDate = (date: Date, today = new Date()): string =>
	format(date, date.getFullYear() === today.getFullYear() ? 'd MMMM' : "d MMMM yyyy 'года'", { locale: ru });

export const formatRange = (start: Date, end: Date): string => {
	const sameYear = start.getFullYear() === end.getFullYear();
	const sameMonth = sameYear && start.getMonth() === end.getMonth();

	const startFormat = sameMonth ? 'd' : sameYear ? 'd MMMM' : 'd MMMM yyyy';
	const endFormat = sameYear ? 'd MMMM' : 'd MMMM yyyy';

	return `С ${format(start, startFormat, { locale: ru })} по ${format(end, endFormat, { locale: ru })}`;
};

export const formatCalculation = (
	state: CalendarState,
	today: Date,
	isWorkingDay?: (date: Date) => boolean,
	afterEnd?: Date | null
): CalendarResult | null => {
	const { mode, range, dayCount, target, includeWeekends } = state;

	if (mode === 'period') {
		if (!range[0] || !range[1]) return null;

		const days = getRangeLength(range, includeWeekends, isWorkingDay);

		return {
			prefix: formatRange(range[0], range[1]),
			value: formatDays(days),
			suffix: includeWeekends ? '(с выходными)' : '(без выходных)',
		};
	}

	if (mode === 'after') {
		const count = parseDayCount(dayCount);
		if (count === null || !afterEnd) return null;

		return {
			prefix: `Через ${formatDays(count)}`,
			value: formatCalendarDate(afterEnd, today),
			suffix: includeWeekends ? '(с выходными)' : '(без выходных)',
		};
	}

	if (!target) return null;

	const difference = differenceInCalendarDays(target, today);
	if (difference === 0) return { prefix: '', value: 'Сегодня' };

	const days = Math.abs(getDaysUntil(today, target, includeWeekends, isWorkingDay));

	const verb =
		difference < 0
			? pluralize(days, 'прошёл', 'прошло', 'прошло')
			: pluralize(days, 'остался', 'осталось', 'осталось');

	return {
		prefix: `${difference < 0 ? 'С' : 'До'} ${formatCalendarDate(target, today)} ${verb}`,
		value: formatDays(days),
		suffix: includeWeekends ? '(с выходными)' : '(без выходных)',
	};
};

export const formatCalculationText = (result: CalendarResult, mode: CalendarMode): string => {
	const separator = mode === 'until' ? ' ' : ': ';
	const text = result.prefix ? `${result.prefix}${separator}${result.value}` : result.value;

	return result.suffix ? `${text} ${result.suffix}` : text;
};
