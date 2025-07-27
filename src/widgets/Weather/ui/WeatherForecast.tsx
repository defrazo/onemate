import type { ForecastItem } from '../model';
import { ForecastCard } from '.';

interface WeatherForecastProps {
	city: string;
	forecastWeather: ForecastItem[];
}

export const WeatherForecast = ({ city, forecastWeather }: WeatherForecastProps) => {
	return (
		<>
			<div className="py-2.5 text-center text-xl leading-0">
				Прогноз погоды в <span className="text-[var(--accent-default)]">{city}</span> на 5 дней
			</div>
			<div className="grid grid-cols-5 divide-x divide-[var(--border-color)] py-2">
				{forecastWeather.map((item) => (
					<ForecastCard key={item.date} {...item} />
				))}
			</div>
		</>
	);
};
