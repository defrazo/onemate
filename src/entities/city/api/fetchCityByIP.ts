import { API_URLS, LOCATION_API_KEY } from '@/shared/config/apiConfig';
import { handleError } from '@/shared/lib/errors';

import type { City } from '../model';
import { fetchCityByCoordinates } from '.';

// Автоматическое получение местоположения по IP без запроса у пользователя
export const fetchCityByIP = async (): Promise<City | null> => {
	try {
		const url = `${API_URLS.locationByIP}?token=${LOCATION_API_KEY}`;
		const response = await fetch(url);
		const data = await response.json();

		const [lat, lon] = data.loc.split(',').map(Number);
		const city = await fetchCityByCoordinates(lat, lon);
		return city;
	} catch (error) {
		handleError(error);
		return null;
	}
};
