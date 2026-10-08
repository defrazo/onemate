import {
	IconDroplets,
	IconEye,
	IconSunrise,
	IconSunset,
	IconTemperatureSnow,
	IconTemperatureSun,
	IconTornado,
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
		visibility,
		wind: { deg, speed, gust },
		weather,
	} = current;

	const formatVisibility = (visibility: number) =>
		visibility >= 1000 ? `${(visibility / 1000).toFixed(visibility % 1000 === 0 ? 0 : 1)} км` : `${visibility} м`;

	const condition = weather[0];

	return (
		<div className="flex min-h-0 flex-1 flex-col justify-center gap-2 py-3 xl:grid xl:grid-cols-[0.9fr_1.1fr] xl:gap-x-4">
			<div className="grid h-full grid-cols-[0.8fr_1.2fr] items-center xl:grid-cols-1 xl:grid-rows-4">
				<div className="flex items-center justify-end xl:row-span-2 xl:justify-center">
					<ConditionIcon
						className="-my-4 size-30 transition-transform duration-200 hover:scale-105"
						condition={condition.icon}
						description={condition.description}
					/>
				</div>
				<div className="hidden xl:flex xl:items-center xl:justify-center">
					<span className="trim -mt-8 ml-4 text-3xl 2xl:text-5xl">{Math.round(temp)}°</span>
				</div>
				<div className="flex flex-col items-center xl:justify-center">
					<span className="trim mb-3 text-3xl xl:mb-1 xl:hidden">{Math.round(temp)}°</span>
					<span className="max-w-full truncate text-sm xl:text-base">
						{capitalizeFirstLetter(condition.description)}
					</span>
					<span className="not-md:trim text-xs text-(--text-secondary) xl:text-sm">
						Ощущается как <span className="text-(--accent-primary)">{Math.round(feels_like)}°</span>
					</span>
				</div>
			</div>
			<div className="grid grid-cols-2 gap-2 xl:grid-rows-4">
				<Metric icon={IconTemperatureSun} label="Максимум" value={`${Math.round(temp_max)}°`} />
				<Metric icon={IconTemperatureSnow} label="Минимум" value={`${Math.round(temp_min)}°`} />
				<Metric icon={IconSunrise} label="Восход" value={formatTime(sunrise)} />
				<Metric icon={IconSunset} label="Закат" value={formatTime(sunset)} />
				<Tooltip content={getWindDirection(deg)}>
					<Metric icon={IconWind} label="Ветер" value={`${speed.toFixed(1)} м/с`} />
				</Tooltip>
				<Metric icon={IconTornado} label="Порывы" value={gust !== undefined ? `${gust.toFixed(1)} м/с` : '–'} />
				<Metric icon={IconDroplets} label="Влажность" value={`${humidity}%`} />
				<Metric icon={IconEye} label="Видимость" value={formatVisibility(visibility)} />
			</div>
		</div>
	);
});
