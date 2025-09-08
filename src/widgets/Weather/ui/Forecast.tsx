import type { ForecastType } from '../model';
import { ForecastCard } from '.';

interface ForecastProps {
	forecast: ForecastType[];
}

export const Forecast = ({ forecast }: ForecastProps) => {
	return (
		<>
			<div className="grid grid-cols-5 divide-x divide-[var(--border-color)] py-2">
				{forecast.map((item) => (
					<ForecastCard key={item.date} {...item} />
				))}
			</div>
		</>
	);
};
