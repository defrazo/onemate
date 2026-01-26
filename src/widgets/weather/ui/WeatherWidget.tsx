import { observer } from 'mobx-react-lite';

import { useStore } from '@/app/providers';
import LocationSearch from '@/features/location';
import { WIDGET_TIPS } from '@/shared/content';
import { Button, ErrorFallback, LoadFallback, Tooltip } from '@/shared/ui';

import { Current, Forecast } from '.';

const WeatherWidget = () => {
	const { cityStore, locationStore, weatherStore: store } = useStore();

	return (
		<>
			<div className="flex items-center">
				<Tooltip content={WIDGET_TIPS.weather}>
					<h1 className="core-header">Погода</h1>
				</Tooltip>
				{(locationStore.isLoading || store.isLoading) && (
					<p className="mx-6 px-2 text-center text-xs leading-3 text-(--accent-default)">
						Данные могут загружаться дольше обычного из-за задержек в работе внешнего сервиса.
					</p>
				)}
			</div>
			{store.isError ? (
				<ErrorFallback onRetry={() => cityStore.restart()} />
			) : (
				<div className="relative flex flex-1 flex-col justify-between">
					{(locationStore.isLoading || store.isLoading) && (
						<div className="absolute inset-0 z-40 cursor-progress" />
					)}
					<LocationSearch />
					{store.isLoading && !store.isReady ? (
						<LoadFallback />
					) : (
						<>
							{store.isOpenCurrent ? (
								<Current current={store.current!} />
							) : (
								<Forecast forecast={store.forecast} />
							)}
						</>
					)}
					<Button className="w-full text-sm" variant="accent" onClick={() => store.setIsOpenCurrent()}>
						{store.isOpenCurrent ? 'Прогноз на 5 дней' : 'Текущая погода'}
					</Button>
				</div>
			)}
		</>
	);
};

export default observer(WeatherWidget);
