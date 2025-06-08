import { API_URLS, WEATHER_API_KEY } from '@/shared/config/apiConfig';

// Валидация значения через запрос
export const fetchWeather = async (city: string): Promise<boolean> => {
	try {
		const response = await fetch(
			`${API_URLS.openWeather}find?q=${city}&units=metric&lang=ru&appid=${WEATHER_API_KEY}`
		);

		if (!response.ok) return false;

		return true;
	} catch {
		return false;
	}
};
