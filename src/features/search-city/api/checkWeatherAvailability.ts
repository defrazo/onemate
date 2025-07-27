import { OPENWEATHER_API_KEY, OPENWEATHER_API_URL } from '@/shared/lib/constants';

// Проверка доступности погоды по запрашиваемому городу
export const checkWeatherAvailability = async (lat: number, lon: number): Promise<boolean> => {
	try {
		const url = `${OPENWEATHER_API_URL}weather?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}`;
		const response = await fetch(url);

		return response.ok;
	} catch {
		return false;
	}
};
