import { addBusinessDays, addDays, differenceInCalendarDays, isValid, isWeekend, startOfDay } from 'date-fns';

import { getProductionYears, MAX_PRODUCTION_DAYS, MAX_PRODUCTION_YEARS, ProductionRangeError } from './production';

export const MAX_DAY_COUNT = 365;

export const parseDayCount = (value: string): number | null => {
	if (!/^\d+$/.test(value)) return null;

	const count = Number(value);

	return Number.isSafeInteger(count) && count <= MAX_DAY_COUNT ? count : null;
};

export const getDateAfter = (
	start: Date,
	value: string,
	includeWeekends: boolean,
	isWorkingDay?: (date: Date) => boolean
): Date | null => {
	const count = parseDayCount(value);
	if (count === null || !isValid(start)) return null;

	if (!includeWeekends && isWorkingDay) {
		if (count > MAX_PRODUCTION_DAYS) throw new ProductionRangeError();

		let date = startOfDay(start);
		let remaining = count;

		while (remaining > 0) {
			date = addDays(date, 1);

			if (date.getFullYear() - start.getFullYear() >= MAX_PRODUCTION_YEARS) throw new ProductionRangeError();

			if (isWorkingDay(date)) remaining--;
		}

		return date;
	}

	const date = includeWeekends ? addDays(start, count) : addBusinessDays(start, count);

	return isValid(date) ? startOfDay(date) : null;
};

export const getDaysUntil = (
	start: Date,
	target: Date,
	includeWeekends: boolean,
	isWorkingDay?: (date: Date) => boolean
): number => {
	const difference = differenceInCalendarDays(target, start);

	if (includeWeekends || difference === 0) return difference;

	const direction = Math.sign(difference);
	const length = Math.abs(difference);

	if (isWorkingDay) {
		getProductionYears(start, target);

		let days = 0;

		for (let step = 1; step <= length; step++) {
			if (isWorkingDay(addDays(start, direction * step))) days++;
		}

		return days === 0 ? 0 : direction * days;
	}

	const weeks = Math.floor(length / 7);
	let days = weeks * 5;

	for (let step = weeks * 7 + 1; step <= length; step++) {
		if (!isWeekend(addDays(start, direction * step))) days++;
	}

	return days === 0 ? 0 : direction * days;
};
