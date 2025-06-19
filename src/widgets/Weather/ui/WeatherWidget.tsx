import { forwardRef } from 'react';
import { observer } from 'mobx-react-lite';

import { cityStore } from '@/entities/city';
import { cn } from '@/shared/lib/utils';
import { Button, Preloader } from '@/shared/ui';

import { useWeather } from '../model';
import { WeatherCurrent, WeatherForecast } from '.';

interface WeatherWidgetProps {
	className?: string;
}
// const WeatherWidget = () => {
const WeatherWidget = forwardRef<HTMLDivElement, WeatherWidgetProps>((props, ref) => {
	const { currentWeather, forecastWeather, isOpenWeather, toggleView } = useWeather(cityStore.currentCity.name);

	return (
		<div
			ref={ref}
			{...props}
			// className="core-card core-base flex flex-1 flex-col gap-2 shadow-[var(--shadow)] select-none"
			className={cn(
				'core-card core-base flex flex-1 flex-col gap-2 shadow-[var(--shadow)] select-none',
				props.className
			)}
		>
			<div className="core-header">Погода</div>
			{!currentWeather ? (
				<div className="flex flex-1 items-center justify-center">
					<Preloader className="size-25" />
				</div>
			) : (
				// <div className="core-theme-elements flex h-full flex-col rounded-lg p-4">
				<div className="flex h-full flex-col rounded-lg">
					<div className="flex h-full flex-col justify-between">
						{isOpenWeather ? (
							<WeatherCurrent currentWeather={currentWeather} />
						) : (
							<WeatherForecast forecastWeather={forecastWeather} />
						)}
					</div>
					<div>
						<Button className="mt-2 h-10 w-full" variant="accent" onClick={toggleView}>
							{isOpenWeather ? 'Прогноз на 5 дней' : 'Текущая погода'}
						</Button>
					</div>
				</div>
			)}
		</div>
	);
});

export default observer(WeatherWidget);
