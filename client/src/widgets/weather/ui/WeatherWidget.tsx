import { observer } from 'mobx-react-lite';

import { useStore } from '@/app/providers';
import LocationSearch from '@/features/location-search';
import { Button, LoadFallback, Tooltip } from '@/shared/ui';

import { WEATHER_TIP } from '../model';
import { Current, Forecast } from '.';

const WeatherWidget = () => {
	const { weatherStore } = useStore();

	return (
		<>
			<div className="flex items-center">
				<Tooltip content={WEATHER_TIP}>
					<h1 className="core-header">Погода</h1>
				</Tooltip>
			</div>
			<div className="relative flex flex-1 flex-col justify-between">
				<LocationSearch value={weatherStore.location} onSelect={(city) => weatherStore.setLocation(city)} />
				{weatherStore.isLoading && !weatherStore.isReady ? (
					<LoadFallback />
				) : (
					<>
						{weatherStore.isOpenCurrent ? (
							<Current current={weatherStore.current} />
						) : (
							<Forecast forecast={weatherStore.forecast} />
						)}
					</>
				)}
				<Button className="w-full text-sm" variant="accent" onClick={() => weatherStore.setIsOpenCurrent()}>
					{weatherStore.isOpenCurrent ? 'Прогноз на 5 дней' : 'Текущая погода'}
				</Button>
			</div>
		</>
	);
};

export default observer(WeatherWidget);
