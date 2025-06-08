import { useEffect, useState } from 'react';

import { appStore } from '@/shared/store/appStore';

import { fetchWeatherData } from '../api';
import { ForecastItem, WeatherData } from '../model';

export const useWeather = (city: string) => {
	const [currentWeather, setCurrentWeather] = useState<WeatherData | null>(null);
	const [forecastWeather, setForecastWeather] = useState<ForecastItem[]>([]);
	const [isOpenWeather, setIsOpenWeather] = useState<boolean>(true);
	const toggleView = () => setIsOpenWeather(!isOpenWeather);

	useEffect(() => {
		const loadWeather = async () => {
			if (!city) return;

			try {
				const { weather: weatherData, forecast: forecastData } = await fetchWeatherData(city);

				setCurrentWeather(weatherData);
				setForecastWeather(forecastData);
			} catch (error: any) {
				appStore.setError(error.message);
			}
		};

		loadWeather();
	}, [city]);

	return {
		currentWeather,
		forecastWeather,
		isOpenWeather,
		toggleView,
	};
};
