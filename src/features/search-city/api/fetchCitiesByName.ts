import type { City } from '@/entities/city';
import { GEOCITY_API_URL, OPENWEATHER_API_KEY } from '@/shared/lib/constants';
import { handleError } from '@/shared/lib/errors';

// Получение списка городов с регионами
export const fetchCitiesByName = async (query: string, signal?: AbortSignal): Promise<City[]> => {
	try {
		const url = `${GEOCITY_API_URL}?q=${encodeURIComponent(query)}&limit=10&appid=${OPENWEATHER_API_KEY}&lang=ru`;
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
