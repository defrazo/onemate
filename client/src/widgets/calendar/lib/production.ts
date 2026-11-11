import { getDayOfYear, isSaturday, isWeekend } from 'date-fns';

import { PRODUCTION_DAY, type ProductionDay, type ProductionYear } from '../model/types';

export const MAX_PRODUCTION_DAYS = 366;
export const MAX_PRODUCTION_YEARS = 3;

export const PRODUCTION_LIMIT_MESSAGE = 'Производственный расчёт: не более 366 рабочих дней и трёх календарных лет';

const FEDERAL_HOLIDAYS: Record<string, string> = {
	'1-1': 'Новогодние каникулы',
	'1-2': 'Новогодние каникулы',
	'1-3': 'Новогодние каникулы',
	'1-4': 'Новогодние каникулы',
	'1-5': 'Новогодние каникулы',
	'1-6': 'Новогодние каникулы',
	'1-7': 'Рождество Христово',
	'1-8': 'Новогодние каникулы',
	'2-23': 'День защитника Отечества',
	'3-8': 'Международный женский день',
	'5-1': 'Праздник Весны и Труда',
	'5-9': 'День Победы',
	'6-12': 'День России',
	'11-4': 'День народного единства',
};

export type ProductionDecoration = {
	kind: 'holiday' | 'nonWorking' | 'workingSaturday' | 'shortened' | null;
	label: string;
};

export class MissingProductionYear extends Error {
	constructor(readonly year: number) {
		super(`Не загружен производственный календарь за ${year} год`);
	}
}

export class ProductionRangeError extends Error {
	constructor() {
		super(PRODUCTION_LIMIT_MESSAGE);
	}
}

export const getProductionYears = (start: Date, end: Date): number[] => {
	const first = Math.min(start.getFullYear(), end.getFullYear());
	const last = Math.max(start.getFullYear(), end.getFullYear());

	if (last - first >= MAX_PRODUCTION_YEARS) throw new ProductionRangeError();

	return Array.from({ length: last - first + 1 }, (_, index) => first + index);
};

export const getProductionDay = (date: Date, years: ReadonlyMap<number, ProductionYear>): ProductionDay => {
	const calendar = years.get(date.getFullYear());
	if (!calendar) throw new MissingProductionYear(date.getFullYear());

	const value = calendar.days[getDayOfYear(date) - 1];

	if (value !== PRODUCTION_DAY.off && value !== PRODUCTION_DAY.working && value !== PRODUCTION_DAY.shortened)
		throw new Error('Неизвестный тип производственного дня');

	return value;
};

export const isProductionWorkingDay = (date: Date, years: ReadonlyMap<number, ProductionYear>): boolean =>
	getProductionDay(date, years) !== PRODUCTION_DAY.off;

export const getFederalHoliday = (date: Date): string | null =>
	FEDERAL_HOLIDAYS[`${date.getMonth() + 1}-${date.getDate()}`] ?? null;

export const getProductionDecoration = (
	date: Date,
	years?: ReadonlyMap<number, ProductionYear>
): ProductionDecoration | null => {
	if (!years) return null;

	const day = getProductionDay(date, years);
	const holiday = getFederalHoliday(date);

	if (day === PRODUCTION_DAY.off) {
		if (holiday) return { kind: 'holiday', label: holiday };
		return isWeekend(date) ? null : { kind: 'nonWorking', label: 'Нерабочий день' };
	}

	if (day === PRODUCTION_DAY.shortened) {
		return {
			kind: 'shortened',
			label: holiday ? `${holiday} · Сокращённый рабочий день` : 'Сокращённый рабочий день',
		};
	}

	if (isSaturday(date)) {
		return {
			kind: 'workingSaturday',
			label: holiday ? `${holiday} · Рабочий день` : 'Рабочий день',
		};
	}

	return holiday ? { kind: null, label: holiday } : null;
};
