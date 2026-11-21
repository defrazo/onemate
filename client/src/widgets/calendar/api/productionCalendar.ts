import { isLeapYear } from 'date-fns';

import { API_URLS } from '@/shared/config';

import { PRODUCTION_DAY, type ProductionYear } from '../model/types';

export const PRODUCTION_TIMEOUT = 30_000;

const validateYear = (year: number) => {
	if (!Number.isInteger(year) || year < 1000 || year > 9999) throw new Error('Некорректный год');
};

export const parseProductionYear = (year: number, data: unknown): ProductionYear => {
	validateYear(year);

	const daysInYear = isLeapYear(new Date(year, 0, 1)) ? 366 : 365;

	if (typeof data !== 'string' || data.length !== daysInYear || !/^[012]+$/.test(data))
		throw new Error('Некорректный производственный календарь');

	const days = Uint8Array.from(data, (status) => {
		if (status === '0') return PRODUCTION_DAY.working;
		if (status === '1') return PRODUCTION_DAY.off;

		return PRODUCTION_DAY.shortened;
	});

	return { year, days };
};

export const fetchProductionYear = async (year: number, signal: AbortSignal): Promise<ProductionYear> => {
	validateYear(year);

	const controller = new AbortController();
	const abort = () => controller.abort();

	if (signal.aborted) controller.abort();
	else signal.addEventListener('abort', abort, { once: true });

	const timeout = setTimeout(abort, PRODUCTION_TIMEOUT);

	try {
		const response = await fetch(`${API_URLS.ISDAYOFF}?year=${year}&cc=ru&pre=1`, {
			signal: controller.signal,
			credentials: 'omit',
		});
		if (!response.ok) throw new Error('Не удалось загрузить производственный календарь');

		const contentType = response.headers.get('content-type')?.split(';')[0].trim().toLowerCase();
		if (contentType !== 'text/plain') throw new Error('Некорректный тип ответа');

		const data = await response.text();

		if (controller.signal.aborted) throw new DOMException('Запрос отменён', 'AbortError');

		return parseProductionYear(year, data);
	} finally {
		clearTimeout(timeout);
		signal.removeEventListener('abort', abort);
	}
};
