import { API_URLS, WEATHER_API_KEY } from '@/shared/config/apiConfig';
import { ApiError, handleError } from '@/shared/lib/errors';
import { convertDate, dayOfWeek, formatDate } from '@/shared/lib/utils';

import type { ForecastApiItem, ForecastItem, WeatherData } from '../model';

// Получение текущей погоды и прогноза на 5 дней для выбранного города
export const fetchWeatherData = async (
	city: string
): Promise<{ weather: WeatherData | null; forecast: ForecastItem[] }> => {
	try {
		const [resCurrent, resForecast] = await Promise.all([
			fetch(`${API_URLS.openWeather}weather?q=${city}&units=metric&lang=ru&appid=${WEATHER_API_KEY}`),
			fetch(`${API_URLS.openWeather}forecast?q=${city}&units=metric&lang=ru&appid=${WEATHER_API_KEY}`),
		]);

		if (!resCurrent.ok) throw new ApiError();
		if (!resForecast.ok) throw new ApiError();

		const currentData = await resCurrent.json();
		const forecastData = await resForecast.json();

		if (currentData.cod !== 200) throw new ApiError();
		if (forecastData.cod !== '200') throw new ApiError();

		const grouped: Record<string, ForecastApiItem[]> = {};

		forecastData.list.forEach((item: ForecastApiItem) => {
			const date = formatDate(item.dt);
			if (!grouped[date]) grouped[date] = [];
			grouped[date].push(item);
		});

		const forecast: ForecastItem[] = Object.keys(grouped)
			.slice(0, 5)
			.map((date) => {
				const entries = grouped[date];
				const temps = entries.map((i) => i.main.temp);
				const min = Math.min(...temps);
				const max = Math.max(...temps);

				const icons = entries.map((i) => i.weather[0].icon);
				const descriptions = entries.map((i) => i.weather[0].description);

				const icon = icons.length === 8 ? icons[4] : icons[0];
				const description = descriptions.length === 8 ? descriptions[4] : descriptions[0];

				const formattedDate = convertDate(date, 'short');
				const formattedDay = dayOfWeek(entries[0].dt, 'short');

				return {
					date: formattedDate,
					day: formattedDay,
					minTemp: Math.round(min),
					maxTemp: Math.round(max),
					description,
					icon,
				};
			});

		return { weather: currentData, forecast };
	} catch (error) {
		handleError(error);
		return { weather: null, forecast: [] };
	}
};
