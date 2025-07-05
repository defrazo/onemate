import { API_URLS, WEATHER_API_KEY } from '@/shared/config/apiConfig';

// Валидация введенного города через запрос к серверу
export const fetchWeather = async (city: string): Promise<boolean> => {
	try {
		const url = `${API_URLS.openWeather}find?q=${city}&units=metric&lang=ru&appid=${WEATHER_API_KEY}`;
		const response = await fetch(url);

		if (!response.ok) return false;

		return true;
	} catch {
		return false;
	}
};
