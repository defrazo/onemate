import {
	IconDroplets,
	IconSunrise,
	IconSunset,
	IconTemperatureSnow,
	IconTemperatureSun,
	IconWind,
} from '@tabler/icons-react';
import { observer } from 'mobx-react-lite';

import { useStore } from '@/app/providers';
import { capitalizeFirstLetter, formatTime } from '@/shared/lib/utils';
import { Tooltip } from '@/shared/ui';

import { getWindDirection } from '../../lib';
import { ConditionIcon, Metric } from '.';

export const Current = observer(() => {
	const { weatherStore } = useStore();

	const current = weatherStore.current;
	if (!current) return null;

	const {
		main: { temp, temp_max, temp_min, humidity, feels_like },
		sys: { sunrise, sunset },
		wind: { deg, speed },
		weather,
	} = current;

	const condition = weather[0];

	return (
		<div className="grid flex-1 grid-cols-2 grid-rows-3 items-center gap-x-4 py-3">
			<div className="flex justify-start">
				<div className="flex items-center gap-2.5">
					<div className="h-9 w-0.5 bg-(--accent-default)" />
					<div className="flex flex-col">
						<span>{capitalizeFirstLetter(condition.description)}</span>
						<span className="text-sm text-(--color-secondary)">
							Ощущается как <span className="text-(--accent-default)">{Math.round(feels_like)}°C</span>
						</span>
					</div>
				</div>
			</div>
			<div className="grid grid-cols-2">
				<Metric icon={IconTemperatureSun} label="Максимум" value={`${Math.round(temp_max)}°`} />
				<Metric icon={IconTemperatureSnow} label="Минимум" value={`${Math.round(temp_min)}°`} />
			</div>
			<div className="flex justify-center">
				<ConditionIcon
					className="-my-4 size-26 transition-transform duration-200 hover:scale-105"
					condition={condition.icon}
					description={condition.description}
				/>
			</div>
			<div className="grid grid-cols-2">
				<Metric icon={IconSunrise} label="Восход" value={formatTime(sunrise)} />
				<Metric icon={IconSunset} label="Закат" value={formatTime(sunset)} />
			</div>
			<div className="flex justify-center">
				<span className="trim text-2xl xl:text-3xl 2xl:text-5xl">{Math.round(temp)}°C</span>
			</div>
			<div className="grid grid-cols-2">
				<Tooltip content={getWindDirection(deg)}>
					<Metric icon={IconWind} label="Ветер" value={`${speed} м/с`} />
				</Tooltip>
				<Metric icon={IconDroplets} label="Влажность" value={`${humidity}%`} />
			</div>
		</div>
	);
});
