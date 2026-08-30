import { API_URLS } from '@/shared/lib/constants';
import { ApiError, EmptyResultError, handleError } from '@/shared/lib/errors';

import type { CBRDailyResponse, RatesResponse } from '../model';

export const fetchRates = async (): Promise<RatesResponse | null> => {
	try {
		const response = await fetch(API_URLS.CBR_LATEST);
		if (!response.ok) throw new ApiError();

		const data: CBRDailyResponse = await response.json();
		if (!data || !data.Valute) throw new EmptyResultError('Не удалось получить курсы валют');

		const lastUpdate =
			Math.floor(new Date(data.Timestamp || data.Date).getTime() / 1000) || Math.floor(Date.now() / 1000);

		const rates: RatesResponse['rates'] = { RUB: 1 };
		for (const [code, valute] of Object.entries(data.Valute)) {
			if (valute && valute.Value > 0 && valute.Nominal > 0) rates[code] = valute.Nominal / valute.Value;
		}

		return { base: 'RUB', lastUpdate, rates };
	} catch (error) {
		handleError(error);
		return null;
	}
};
