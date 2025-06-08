import { API_URLS } from '@/shared/config/apiConfig';
import { ApiError, EmptyResultError, handleError } from '@/shared/lib/errors';

import { City } from '../model';

// Получение города по координатам (для определения местоположения через браузер)
export const fetchCityByCoordinates = async (lat: number, lon: number): Promise<City | null> => {
	try {
		const response = await fetch(`${API_URLS.openStreet}/reverse?lat=${lat}&lon=${lon}&format=json`);

		if (!response.ok) throw new ApiError();

		const data = await response.json();

		const address = data.address;

		const name = address.hamlet || address.village || address.town || address.city || address.locality;

		const region = address.state || address.region || '';
		const country = address.country || 'Неизвестная страна';

		if (!name) {
			throw new EmptyResultError('Не удалось автоматически определить местоположение');
		}

		const city: City = {
			name,
			region,
			country,
			lat,
			lon,
		};

		return city;
	} catch (error) {
		handleError(error);
		return null;
	}
};
// export const fetchCityByCoordinates = async (lat: number, lon: number): Promise<string | null> => {
// 	try {
// 		const response = await fetch(`${API_URLS.reverseGeocode}?lat=${lat}&lon=${lon}&format=json`);

// 		if (!response.ok) throw new ApiError();

// 		const data = await response.json();

// 		const address = data.address;
// 		const city =
// 			address.hamlet ||
// 			address.village ||
// 			address.town ||
// 			address.city ||
// 			address.locality ||
// 			'Неизвестное место';

// 		if (city === 'Неизвестное место')
// 			throw new EmptyResultError('Не удалось автоматически определить местоположение');

// 		return city;
// 	} catch (error) {
// 		handleError(error);
// 		return null;
// 	}
