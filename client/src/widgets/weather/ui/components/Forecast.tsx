import { observer } from 'mobx-react-lite';

import { useStore } from '@/app/providers';
import { capitalizeFirstLetter } from '@/shared/lib/utils';

import { ConditionIcon } from '.';

export const Forecast = observer(() => {
	const { weatherStore } = useStore();

	const forecast = weatherStore.forecast;
	if (!forecast.length) return null;

	return (
		<div className="grid flex-1 grid-cols-5 py-4">
			{forecast.map(({ date, day, icon, description, maxTemp, minTemp }) => (
				<div className="group/day grid flex-1 grid-rows-[auto_1fr_auto] items-center justify-center rounded-xl px-1 py-4 transition-colors hover:bg-(--accent-default)/5">
					<div className="flex flex-col items-center gap-2">
						<span className="trim text-sm font-bold">{date}</span>
						<span className="trim text-sm text-(--color-secondary)">{day}</span>
						<span className="h-0.5 w-5 rounded-full bg-(--border-color) group-hover/day:bg-(--accent-default)" />
					</div>
					<ConditionIcon
						className="size-18 transition-transform duration-200 group-hover/day:scale-105"
						condition={icon}
						description={description}
						title={capitalizeFirstLetter(description)}
					/>
					<div className="flex items-baseline justify-center gap-1">
						<span className="text-xl font-bold text-(--accent-default)">{maxTemp}°</span>
						<span className="text-sm text-(--color-secondary)">/ {minTemp}°</span>
					</div>
				</div>
			))}
		</div>
	);
});
