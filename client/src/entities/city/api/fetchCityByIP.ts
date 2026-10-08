import { api } from '@/shared/api';
import { handleError } from '@/shared/lib/errors';

import type { City } from '../model';

// Автоматическое получение местоположения по IP без запроса у пользователя
export const fetchCityByIP = async (): Promise<City | null> => {
	try {
		const { data } = await api.get<{ location: City | null }>('/user/location/detect');
		return data.location;
	} catch (error) {
		handleError(error);
		return null;
	}
};
