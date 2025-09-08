import { API_URLS } from '@/shared/lib/constants';
import { ApiError, EmptyResultError, handleError } from '@/shared/lib/errors';

import type { RatesResponse } from '../model';

export const fetchRates = async (): Promise<RatesResponse | null> => {
	try {
		const response = await fetch(API_URLS.CBR_LATEST);
		if (!response.ok) throw new ApiError();

		const data = await response.json();
		if (!data || !data.rates) throw new EmptyResultError('Не удалось получить курсы валют');

		const rates: RatesResponse['rates'] = { ...data.rates, RUB: 1 };

		return { base: 'RUB', lastUpdate: data.timestamp, rates };
	} catch (error) {
		handleError(error);
		return null;
	}
};
