import { API_URLS, env } from '@/shared/lib/constants';

// Проверка доступности погоды по запрашиваемому городу
export const checkWeatherAvailability = async (lat: number, lon: number): Promise<boolean> => {
	try {
		const url = `${API_URLS.OPENWEATHER_BASE}weather?lat=${lat}&lon=${lon}&appid=${env.OPENWEATHER_API_KEY}`;
		const response = await fetch(url);

		return response.ok;
	} catch {
		return false;
	}
};
