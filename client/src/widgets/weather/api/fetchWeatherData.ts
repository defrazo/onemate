import { API_URLS, env } from '@/shared/lib/constants';
import { ApiError, handleError } from '@/shared/lib/errors';
import { convertDate, dayOfWeek, formatDate } from '@/shared/lib/utils';

import type { CurrentType, ForecastApiItem, ForecastType } from '../model';

type WeatherData = {
	weather: CurrentType | null;
	forecast: ForecastType[];
};

// Получение текущей погоды и прогноза на 5 дней по координатам
export const fetchWeatherData = async (lat: number, lon: number): Promise<WeatherData> => {
	try {
		const params = `lat=${lat}&lon=${lon}&units=metric&lang=ru&appid=${env.OPENWEATHER_API_KEY}`;

		const [resCurrent, resForecast] = await Promise.all([
			fetch(`${API_URLS.OPENWEATHER_BASE}weather?${params}`),
			fetch(`${API_URLS.OPENWEATHER_BASE}forecast?${params}`),
		]);

		if (!resCurrent.ok || !resForecast.ok) throw new ApiError();

		const currentData = await resCurrent.json();
		const forecastData = await resForecast.json();

		const grouped: Record<string, ForecastApiItem[]> = {};

		forecastData.list.forEach((item: ForecastApiItem) => {
			const date = formatDate(item.dt);
			if (!grouped[date]) grouped[date] = [];
			grouped[date].push(item);
		});

		const forecast: ForecastType[] = Object.entries(grouped)
			.slice(0, 5)
			.map(([date, entries]) => {
				const temps = entries.map((item) => item.main.temp);

				const middleIndex = Math.floor(entries.length / 2);
				const representative = entries[middleIndex];

				return {
					date: convertDate(date, 'short'),
					day: dayOfWeek(entries[0].dt, 'short'),
					minTemp: Math.round(Math.min(...temps)),
					maxTemp: Math.round(Math.max(...temps)),
					description: representative.weather[0].description,
					icon: representative.weather[0].icon,
				};
			});

		return { weather: currentData, forecast };
	} catch (error) {
		handleError(error);
		return { weather: null, forecast: [] };
	}
};
