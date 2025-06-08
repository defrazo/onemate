import { cityStore } from '@/entities/city';

import { ForecastItem } from '../model';
import { ForecastCard } from '.';

interface WeatherForecastProps {
	forecastWeather: ForecastItem[];
}

const WeatherForecast = ({ forecastWeather }: WeatherForecastProps) => {
	return (
		<div className="flex h-full flex-col items-center justify-evenly gap-2">
			<div className="text-xl leading-none">Прогноз погоды в {cityStore.currentCity.name} на 5 дней</div>
			<div className="grid grid-cols-5 divide-x">
				{forecastWeather.map((item) => (
					<ForecastCard key={item.date} {...item} />
				))}
			</div>
		</div>
	);
};

export default WeatherForecast;
