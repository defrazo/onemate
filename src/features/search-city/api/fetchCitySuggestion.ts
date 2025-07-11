import { City } from '@/entities/city';
import { API_URLS, WEATHER_API_KEY } from '@/shared/config/apiConfig';
import { ApiError, EmptyResultError, handleError } from '@/shared/lib/errors';

// Получение списка городов на основе введенного пользователем значения
export const fetchCitySuggestion = async (queryCity: string, signal?: AbortSignal): Promise<City[]> => {
	try {
		const url = `${API_URLS.openWeather}find?q=${queryCity}&units=metric&lang=ru&appid=${WEATHER_API_KEY}`;
		const response = await fetch(url, { signal });

		if (!response.ok) throw new ApiError();

		const data = await response.json();

		if (data.cod !== '200') throw new ApiError();

		if (!data.list || data.list.length === 0)
			throw new EmptyResultError(`Город «${queryCity}» не найден. Пожалуйста, уточните запрос.`);

		const newData: City[] = data.list.map((city: { name: string; coord: { lat: number; lon: number } }) => ({
			name: city.name,
			coord: city.coord,
		}));

		return newData;
	} catch (error) {
		handleError(error);
		return [];
	}
};
