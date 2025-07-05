import { Droplets, Sunrise, Sunset, ThermometerSnowflake, ThermometerSun, Wind } from 'lucide-react';

import SearchCity from '@/features/search-city';
import { capitalizeFirstLetter, formatTime } from '@/shared/lib/utils';
import { Tooltip } from '@/shared/ui';

import { getWindDirection } from '../lib';
import type { WeatherCode, WeatherData } from '../model';
import { WeatherIcon } from '.';

interface WeatherCurrentProps {
	currentWeather: WeatherData;
}

export const WeatherCurrent = ({ currentWeather }: WeatherCurrentProps) => {
	const {
		main: { temp, temp_max, temp_min, humidity, feels_like },
		sys: { sunrise, sunset },
		wind: { deg, speed },
		weather,
	} = currentWeather;
	const textStyle = 'text-[var(--accent-default)]';

	return (
		<>
			<SearchCity />
			<div className="flex py-2">
				<div className="flex flex-1 flex-col">
					<div className="flex h-full items-center justify-center">
						<WeatherIcon
							className="size-25"
							condition={weather[0].icon as WeatherCode}
							description={weather[0].description}
						/>
						<span className="text-5xl font-bold">{Math.round(temp)}°C</span>
					</div>
					<div className="flex flex-col items-center justify-center">
						<div>{capitalizeFirstLetter(weather[0].description)}</div>
						<div>
							Ощущается как
							<span className={textStyle}> {Math.round(feels_like)}°C</span>
						</div>
					</div>
				</div>
				<div className="h-full w-px bg-[var(--border-color)]" />
				<div className="flex flex-col gap-4 px-2">
					<div className="flex flex-col gap-1">
						<div className="flex items-center gap-2">
							<ThermometerSun className="size-4" />
							Максимум: <span className={textStyle}>{Math.round(temp_max)}°C</span>
						</div>
						<div className="flex items-center gap-2">
							<ThermometerSnowflake className="size-4" />
							Минимум: <span className={textStyle}>{Math.round(temp_min)}°C</span>
						</div>
					</div>
					<div className="flex flex-col gap-1">
						<div className="flex items-center gap-2">
							<Sunrise className="size-4" />
							Восход: <span className={textStyle}>{formatTime(sunrise)}</span>
						</div>
						<div className="flex items-center gap-2">
							<Sunset className="size-4" />
							Закат: <span className={textStyle}>{formatTime(sunset)}</span>
						</div>
					</div>
					<div className="flex flex-col gap-1">
						<Tooltip className="group flex items-center gap-2" text={getWindDirection(deg)}>
							<Wind className="size-4" />
							Ветер: <span className={textStyle}>{speed} м/с</span>
						</Tooltip>
						<div className="flex items-center gap-2">
							<Droplets className="size-4" />
							Влажность: <span className={textStyle}>{humidity}%</span>
						</div>
					</div>
				</div>
			</div>
		</>
	);
};
