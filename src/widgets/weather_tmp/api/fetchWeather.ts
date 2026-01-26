import { API_URLS, env } from '@/shared/lib/constants';

// Валидация введенного города через запрос к серверу
export const fetchWeather = async (city: string): Promise<boolean> => {
	try {
		const url = `${API_URLS.OPENWEATHER_BASE}find?q=${city}&units=metric&lang=ru&appid=${env.OPENWEATHER_API_KEY}`;
		const response = await fetch(url);

		if (!response.ok) return false;

		return true;
	} catch {
		return false;
	}
};
