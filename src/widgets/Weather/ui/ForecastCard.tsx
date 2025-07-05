import { capitalizeFirstLetter } from '@/shared/lib/utils';
import { Tooltip } from '@/shared/ui';

import type { ForecastItem, WeatherCode } from '../model';
import { WeatherIcon } from '.';

interface ForecastCardProps extends ForecastItem {}

export const ForecastCard = ({ date, day, icon, description, maxTemp, minTemp }: ForecastCardProps) => {
	return (
		<div className="flex flex-col justify-between">
			<div className="flex flex-col items-center justify-center capitalize">
				<div className="py-1 font-bold">{date}</div>
				<div>{day}</div>
			</div>
			<Tooltip className="group" text={capitalizeFirstLetter(description)}>
				<WeatherIcon condition={icon as WeatherCode} description={description} />
			</Tooltip>
			<div className="flex flex-col items-center justify-center">
				<div className="text-xl font-bold text-[var(--accent-default)]">{maxTemp}°</div>
				<div className="text-sm">ночь {minTemp}°</div>
			</div>
		</div>
	);
};
