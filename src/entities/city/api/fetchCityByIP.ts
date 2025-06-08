import { API_URLS, LOCATION_API_KEY } from '@/shared/config/apiConfig';
import { handleError } from '@/shared/lib/errors';

import { City } from '../model';
import { fetchCityByCoordinates } from '.';

// Автоматическое получение местоположения по IP без запроса у пользователя
export const fetchCityByIP = async (): Promise<City | null> => {
	try {
		const response = await fetch(`${API_URLS.locationByIP}?token=${LOCATION_API_KEY}`);

		// if (!response.ok) throw new Error('Ошибка получения координат по IP');

		const data = await response.json();

		const [lat, lon] = data.loc.split(',').map(Number);

		// if (!lat || !lon) throw new Error('Некорректные координаты');

		// получаем данные о городе по координатам
		const city = await fetchCityByCoordinates(lat, lon);

		return city;
	} catch (error) {
		handleError(error);
		return null;
	}
};

// export const fetchLocationByIP = async (): Promise<{ lat: number; lon: number } | undefined> => {
// 	try {
// 		const response = await fetch(`${API_URLS.locationByIP}?token=${LOCATION_API_KEY}`);

// 		// if (!response.ok) throw new ApiError();

// 		const data = await response.json();

// 		const [lat, lon] = data.loc.split(',').map(Number);
// 		const coords = { lat, lon };

// 		return coords;
// 	} catch {
// 		return undefined;
// 	}
// };
