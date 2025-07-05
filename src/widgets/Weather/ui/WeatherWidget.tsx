import { observer } from 'mobx-react-lite';

import { cityStore } from '@/entities/city';
import { Button, Preloader } from '@/shared/ui';

import { useWeather } from '../model';
import { WeatherCurrent, WeatherForecast } from '.';

const WeatherWidget = () => {
	const { currentWeather, forecastWeather, isOpenWeather, toggleView } = useWeather(cityStore.currentCity.name);

	return (
		<div className="core-card core-base flex h-full flex-col gap-2 shadow-[var(--shadow)] select-none">
			<h1 className="core-header">Погода</h1>
			{!currentWeather ? (
				<div className="flex flex-1 items-center justify-center">
					<Preloader className="size-25" />
				</div>
			) : (
				<div className="flex h-full flex-col justify-between">
					{isOpenWeather ? (
						<WeatherCurrent currentWeather={currentWeather} />
					) : (
						<WeatherForecast city={cityStore.currentCity.name} forecastWeather={forecastWeather} />
					)}
					<Button className="w-full text-sm" onClick={toggleView}>
						{isOpenWeather ? 'Прогноз на 5 дней' : 'Текущая погода'}
					</Button>
				</div>
			)}
		</div>
	);
};

export default observer(WeatherWidget);
