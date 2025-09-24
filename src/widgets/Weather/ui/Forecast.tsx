import type { ConditionCode, ForecastType } from '../model';
import { ConditionIcon } from '.';
import { Tooltip } from '@/shared/ui';
import { capitalizeFirstLetter, cn } from '@/shared/lib/utils';

interface ForecastProps {
	forecast: ForecastType[];
}

export const Forecast = ({ forecast }: ForecastProps) => {
	return (
		<>
			<div className="flex flex-1 py-4 xl:py-2">
				{forecast.map((item, idx) => (
					<div
						className={cn(
							'flex flex-col justify-between',
							idx !== forecast.length - 1 && 'border-r border-solid border-[var(--border-color)]'
						)}
					>
						<div className="flex flex-col items-center justify-center gap-2 text-sm capitalize md:text-base">
							<div className="font-bold">{item.date}</div>
							<div>{item.day}</div>
						</div>
						<Tooltip className="group" content={capitalizeFirstLetter(item.description)}>
							<ConditionIcon condition={item.icon as ConditionCode} description={item.description} />
						</Tooltip>
						<div className="flex flex-col items-center justify-center gap-2">
							<div className="text-xl font-bold text-[var(--accent-default)]">{item.maxTemp}°</div>
							<div className="flex flex-col items-center text-sm xl:flex-row xl:gap-1">
								<div>ночь</div>
								<div>{item.minTemp}°</div>
							</div>
						</div>
					</div>
				))}
			</div>
		</>
	);
};
