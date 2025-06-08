// import { API_URLS, CURRENCY_API_KEY } from '@/shared/config/apiConfig';
import { API_URLS } from '@/shared/config/apiConfig';
import { ApiError, EmptyResultError, handleError } from '@/shared/lib/errors';

export const fetchRates = async (): Promise<any> => {
	try {
		const response = await fetch(`${API_URLS.cbr}`);

		if (!response.ok) throw new ApiError();

		const data = await response.json();
		// console.log(data);

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

// export const fetchRates = async (baseCurrency: string): Promise<any> => {
// 	try {
// 		const response = await fetch(
// 			`${API_URLS.freeCurrency}apikey=${CURRENCY_API_KEY}&base_currency=${baseCurrency}`
// 		);

// 		if (!response.ok) throw new ApiError();

// 		const data = await response.json();
// 		console.log(data.data, data.meta);
// 		// const currency = data;

// 		if (!data || !data.data) throw new EmptyResultError('Не удалось получить курсы');

// 		return {
// 			data: data.data,
// 			meta: data.meta,
// 		};
// 	} catch (error) {
// 		handleError(error);
// 		return null;
// 	}
// };
