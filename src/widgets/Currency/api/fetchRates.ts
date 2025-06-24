import { API_URLS } from '@/shared/config/apiConfig';
import { ApiError, EmptyResultError, handleError } from '@/shared/lib/errors';

export const fetchRates = async (): Promise<any> => {
	try {
		const response = await fetch(`${API_URLS.cbr}`);

		if (!response.ok) throw new ApiError();

		const data = await response.json();

		if (!data) throw new EmptyResultError('Не удалось получить курсы валют');

		return {
			lastUpdate: data.timestamp,
			rates: data.rates,
		};
	} catch (error) {
		handleError(error);
		return null;
	}
};
