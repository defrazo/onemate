import { OPENWEATHER_API_KEY, OPENWEATHER_API_URL } from '@/shared/lib/constants';

// Валидация введенного города через запрос к серверу
export const fetchWeather = async (city: string): Promise<boolean> => {
	try {
		const url = `${OPENWEATHER_API_URL}find?q=${city}&units=metric&lang=ru&appid=${OPENWEATHER_API_KEY}`;
		const response = await fetch(url);

		if (!response.ok) return false;

		return true;
	} catch {
		return false;
	}
};
