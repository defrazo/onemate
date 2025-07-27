import { CBR_API_URL } from '@/shared/lib/constants';
import { ApiError, EmptyResultError, handleError } from '@/shared/lib/errors';

// Получение актуального курса валют
export const fetchRates = async (): Promise<any> => {
	try {
		const url = `${CBR_API_URL}`;
		const response = await fetch(url);

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
