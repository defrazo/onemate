import { API_URLS, WEATHER_API_KEY } from '@/shared/config/apiConfig';

export const checkWeatherAvailability = async (lat: number, lon: number): Promise<boolean> => {
	try {
		const url = `${API_URLS.openWeather}weather?lat=${lat}&lon=${lon}&appid=${WEATHER_API_KEY}`;
		const res = await fetch(url);
		return res.ok;
	} catch {
		return false;
	}
};
