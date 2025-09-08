import { capitalizeFirstLetter } from '@/shared/lib/utils';
import { Tooltip } from '@/shared/ui';

import type { ConditionCode, ForecastType } from '../model';
import { ConditionIcon } from '.';

interface ForecastCardProps extends ForecastType {}

export const ForecastCard = ({ date, day, icon, description, maxTemp, minTemp }: ForecastCardProps) => {
	return (
		<div className="flex flex-col justify-between">
			<div className="flex flex-col items-center justify-center capitalize">
				<div className="py-1 font-bold">{date}</div>
				<div>{day}</div>
			</div>
			<Tooltip className="group" content={capitalizeFirstLetter(description)}>
				<ConditionIcon condition={icon as ConditionCode} description={description} />
			</Tooltip>
			<div className="flex flex-col items-center justify-center">
				<div className="text-xl font-bold text-[var(--accent-default)]">{maxTemp}°</div>
				<div className="text-sm">ночь {minTemp}°</div>
			</div>
		</div>
	);
};
