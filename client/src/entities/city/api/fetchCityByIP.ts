import { API_URLS, env } from '@/shared/lib/constants';
import { handleError } from '@/shared/lib/errors';

import type { City } from '../model';
import { fetchCityByCoordinates } from '.';

// Автоматическое получение местоположения по IP без запроса у пользователя
export const fetchCityByIP = async (): Promise<City | null> => {
	try {
		const url = `${API_URLS.IPINFO}?token=${env.IPINFO_API_KEY}`;
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
