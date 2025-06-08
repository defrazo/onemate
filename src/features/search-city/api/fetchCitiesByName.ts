import { City } from '@/entities/city';
import { API_URLS, WEATHER_API_KEY } from '@/shared/config/apiConfig';
import { handleError } from '@/shared/lib/errors/errorHandler';

export const fetchCitiesByName = async (query: string, signal?: AbortSignal): Promise<City[]> => {
	try {
		const url = `${API_URLS.geoCity}?q=${encodeURIComponent(query)}&limit=10&appid=${WEATHER_API_KEY}&lang=ru`;
		const res = await fetch(url, { signal });

		if (!res.ok) throw new Error('Ошибка при получении городов');

		const data = await res.json();

		return data.map((item: any) => ({
			name: item.local_names?.ru || item.name,
			country: item.country,
			region: item.state || '',
			lat: item.lat,
			lon: item.lon,
		}));
	} catch (e) {
		handleError(e);
		return [];
	}
};

// import { City } from '@/entities/city';
// import { API_URLS } from '@/shared/config/apiConfig';
// import { handleError } from '@/shared/lib/errors/errorHandler';

// export const fetchCitiesByName = async (query: string, signal?: AbortSignal): Promise<City[]> => {
// 	try {
// 		const url = `${API_URLS.openStreet}?q=${query}&format=json&limit=5`;
// 		const res = await fetch(url, { signal });

// 		if (!res.ok) throw new Error('Ошибка при получении данных');

// 		const data = await res.json();

// 		return data.map((item: any) => ({
// 			name: item.display_name,
// 			coord: {
// 				lat: parseFloat(item.lat),
// 				lon: parseFloat(item.lon),
// 			},
// 			country: item.address?.country || '',
// 			region: item.address?.state || '',
// 		}));
// 	} catch (e) {
// 		handleError(e);
// 		return [];
// 	}
// };
