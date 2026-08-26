import { capitalizeFirstLetter, cn } from '@/shared/lib/utils';
import { Tooltip } from '@/shared/ui';

import type { ConditionCode, ForecastType } from '../model';
import { ConditionIcon } from '.';

interface ForecastProps {
	forecast: ForecastType[];
}

export const Forecast = ({ forecast }: ForecastProps) => {
	return (
		<>
			<div className="flex flex-1 py-4 xl:py-2">
				{forecast.map(({ date, day, icon, description, maxTemp, minTemp }, idx) => (
					<div
						key={date}
						className={cn(
							'flex flex-col justify-between',
							idx !== forecast.length - 1 && 'border-r border-solid border-(--border-color)'
						)}
					>
						<div className="flex flex-col items-center justify-center gap-1 text-sm capitalize md:text-base">
							<div className="font-bold">{date}</div>
							<div>{day}</div>
						</div>
						<Tooltip className="group" content={capitalizeFirstLetter(description)}>
							<ConditionIcon condition={icon as ConditionCode} description={description} />
						</Tooltip>
						<div className="flex flex-col items-center justify-center gap-2">
							<div className="text-xl font-bold text-(--accent-default)">{maxTemp}°</div>
							<div className="flex flex-col items-center text-sm xl:flex-row xl:gap-1">
								<div>ночь</div>
								<div>{minTemp}°</div>
							</div>
						</div>
					</div>
				))}
			</div>
		</>
	);
};
