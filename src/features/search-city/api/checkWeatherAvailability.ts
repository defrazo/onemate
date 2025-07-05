import { API_URLS, WEATHER_API_KEY } from '@/shared/config/apiConfig';

// Проверка доступности погоды по запрашиваемому городу
export const checkWeatherAvailability = async (lat: number, lon: number): Promise<boolean> => {
	try {
		const url = `${API_URLS.openWeather}weather?lat=${lat}&lon=${lon}&appid=${WEATHER_API_KEY}`;
		const response = await fetch(url);

		return response.ok;
	} catch {
		return false;
	}
};
