import type { City } from '@/entities/city';
import { API_URLS, WEATHER_API_KEY } from '@/shared/config/apiConfig';
import { handleError } from '@/shared/lib/errors';

// Получение списка городов с регионами
export const fetchCitiesByName = async (query: string, signal?: AbortSignal): Promise<City[]> => {
	try {
		const url = `${API_URLS.geoCity}?q=${encodeURIComponent(query)}&limit=10&appid=${WEATHER_API_KEY}&lang=ru`;
		const response = await fetch(url, { signal });

		if (!response.ok) throw new Error('Ошибка при получении городов');

		const data = await response.json();

		return data.map((item: any) => ({
			name: item.local_names?.ru || item.name,
			country: item.country,
			region: item.state || '',
			lat: item.lat,
			lon: item.lon,
		}));
	} catch (error) {
		handleError(error);
		return [];
	}
};
