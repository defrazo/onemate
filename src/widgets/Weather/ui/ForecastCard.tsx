import { capitalizeFirstLetter } from '@/shared/lib/utils';
import { Tooltip } from '@/shared/ui';

import { ForecastItem, WeatherCode } from '../model';
import { WeatherIcon } from '.';

interface ForecastCardProps extends ForecastItem {}

const ForecastCard = ({ date, day, icon, description, maxTemp, minTemp }: ForecastCardProps) => {
	return (
		<div className="flex flex-col justify-between border-[var(--color-secondary)] px-1">
			<div className="flex flex-col items-center justify-center capitalize">
				<div>{date}</div>
				<div>{day}</div>
			</div>
			<Tooltip className="group" text={capitalizeFirstLetter(description)}>
				<WeatherIcon condition={icon as WeatherCode} description={description} />
			</Tooltip>
			<div className="flex flex-col items-center justify-center">
				<div className="text-xl font-bold text-[var(--accent-hover)]">{maxTemp}°</div>
				<div>ночь {minTemp}°</div>
			</div>
		</div>
	);
};

export default ForecastCard;
