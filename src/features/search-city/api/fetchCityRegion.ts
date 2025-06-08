import { City } from '@/entities/city';
import { API_URLS } from '@/shared/config/apiConfig';
import { handleError } from '@/shared/lib/errors/errorHandler';
import { ApiError } from '@/shared/lib/errors/errors';

// Получение областей или регионов на основе введенного пользователем значения
export const fetchCityRegion = async (inputCities: City[], signal?: AbortSignal): Promise<City[]> => {
	try {
		const citiesWithRegions = await Promise.all(
			inputCities.map(async (city, index) => {
				const { lat, lon } = city.coord;

				const response = await fetch(`${API_URLS.reverseGeocode}?lat=${lat}&lon=${lon}&format=json`, {
					signal,
				});

				if (!response.ok) throw new ApiError();

				const data = await response.json();

				const address = data.address;
				const name =
					address.hamlet ||
					address.village ||
					address.town ||
					address.city ||
					address.locality ||
					'Неизвестное место';

				return {
					id: index,
					country: address.country,
					name: name,
					region: address.state,
				};
			})
		);

		return citiesWithRegions;
	} catch (error) {
		handleError(error);
		return [];
	}
};
