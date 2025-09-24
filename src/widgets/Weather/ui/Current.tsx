import { Droplets, Sunrise, Sunset, ThermometerSnowflake, ThermometerSun, Wind } from 'lucide-react';

import { capitalizeFirstLetter, formatTime } from '@/shared/lib/utils';
import { Tooltip } from '@/shared/ui';

import { getWindDirection } from '../lib';
import type { ConditionCode, CurrentType } from '../model';
import { ConditionIcon } from '.';

interface CurrentProps {
	current: CurrentType;
}

export const Current = ({ current }: CurrentProps) => {
	const {
		main: { temp, temp_max, temp_min, humidity, feels_like },
		sys: { sunrise, sunset },
		wind: { deg, speed },
		weather,
	} = current;
	const textStyle = 'text-[var(--accent-default)]';

	return (
		<>
			<div className="flex flex-1 py-4 xl:py-2">
				<div className="flex flex-1 flex-col gap-4 px-1">
					<div className="flex h-full flex-col items-center justify-center">
						<ConditionIcon
							className="-mb-2 size-25 lg:mb-0 xl:size-32"
							condition={weather[0].icon as ConditionCode}
							description={weather[0].description}
						/>
						<span className="text-4xl font-bold xl:text-5xl">{Math.round(temp)}°C</span>
					</div>
					<div className="flex flex-col items-center justify-center gap-2 text-center leading-4">
						<div>{capitalizeFirstLetter(weather[0].description)}</div>
						<div>
							Ощущается как
							<span className={textStyle}> {Math.round(feels_like)}°C</span>
						</div>
					</div>
				</div>
				<div className="h-full w-px bg-[var(--border-color)]" />
				<div className="flex flex-col justify-between px-2">
					<div className="flex items-center gap-1 md:gap-2">
						<ThermometerSun className="size-4" />
						Максимум: <span className={textStyle}>{Math.round(temp_max)}°C</span>
					</div>
					<div className="flex items-center gap-1 md:gap-2">
						<ThermometerSnowflake className="size-4" />
						Минимум: <span className={textStyle}>{Math.round(temp_min)}°C</span>
					</div>
					<div className="flex items-center gap-1 md:gap-2">
						<Sunrise className="size-4" />
						Восход: <span className={textStyle}>{formatTime(sunrise)}</span>
					</div>
					<div className="flex items-center gap-1 md:gap-2">
						<Sunset className="size-4" />
						Закат: <span className={textStyle}>{formatTime(sunset)}</span>
					</div>
					<div className="flex items-center gap-1 md:gap-2">
						<Wind className="size-4" />
						<Tooltip content={getWindDirection(deg)}>
							Ветер: <span className={`${textStyle} ml-2`}>{speed} м/с</span>
						</Tooltip>
					</div>
					<div className="flex items-center gap-1 md:gap-2">
						<Droplets className="size-4" />
						Влажность: <span className={textStyle}>{humidity}%</span>
					</div>
				</div>
			</div>
		</>
	);
};
