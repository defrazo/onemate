import SearchCity from '@/features/search-city';
import { capitalizeFirstLetter, formatTime } from '@/shared/lib/utils';
import { Divider, Tooltip } from '@/shared/ui';

import { getWindDirection } from '../lib';
import { WeatherCode, WeatherData } from '../model';
import { WeatherIcon } from '.';

interface WeatherCurrentProps {
	currentWeather: WeatherData;
}

const WeatherCurrent = ({ currentWeather }: WeatherCurrentProps) => {
	const {
		main: { temp, temp_max, temp_min, humidity, feels_like },
		sys: { sunrise, sunset },
		wind: { deg, speed },
		weather,
	} = currentWeather;

	return (
		<div className="grid h-full grid-rows-[auto_1fr_auto]">
			<SearchCity />
			<div className="grid grid-cols-[7fr_3fr]">
				{/* <div className="flex flex-col justify-evenly"> */}
				<div className="grid grid-cols-[auto_1fr] grid-rows-[auto] items-center justify-center gap-x-2">
					<div className="row-span-3 text-5xl font-bold">{Math.round(temp)} °C</div>
					<div>Ощущается: {Math.round(feels_like)} °C</div>
					<div>Максимум: {Math.round(temp_max)} °C</div>
					<div>Минимум: {Math.round(temp_min)} °C</div>

					<div className="col-span-2 h-fit">
						<Divider />
					</div>

					<div>Восход: {formatTime(sunrise)}</div>
					<div>
						<Tooltip className="group" text={getWindDirection(deg)}>
							Ветер: {speed} м/с
						</Tooltip>
					</div>
					<div>Закат: {formatTime(sunset)}</div>
					<div>Влажность: {humidity} %</div>
					{/* </div> */}
				</div>
				<Tooltip className="group" text={capitalizeFirstLetter(weather[0].description)}>
					<WeatherIcon condition={weather[0].icon as WeatherCode} description={weather[0].description} />
				</Tooltip>
			</div>
		</div>
	);
};

export default WeatherCurrent;
