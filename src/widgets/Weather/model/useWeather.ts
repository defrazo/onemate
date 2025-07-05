import { useEffect, useState } from 'react';

import { cityStore } from '@/entities/city';
import { notifyStore } from '@/shared/stores';

import { fetchWeatherData } from '../api';
import type { ForecastItem, WeatherData } from '.';

export const useWeather = (city: string) => {
	const [currentWeather, setCurrentWeather] = useState<WeatherData | null>(null);
	const [forecastWeather, setForecastWeather] = useState<ForecastItem[]>([]);
	const [isOpenWeather, setIsOpenWeather] = useState<boolean>(true);
	const toggleView = () => setIsOpenWeather(!isOpenWeather);

	useEffect(() => {
		const loadWeather = async () => {
			if (!city) {
				await cityStore.resetCurrentCity();
				return;
			}

			try {
				const { weather: weatherData, forecast: forecastData } = await fetchWeatherData(city);

				setCurrentWeather(weatherData);
				setForecastWeather(forecastData);
			} catch (error: any) {
				notifyStore.setError(error.message);
				if (!cityStore.isDefaultCity()) cityStore.resetCurrentCity();
			}
		};

		loadWeather();
	}, [city]);

	return { currentWeather, forecastWeather, isOpenWeather, toggleView };
};
