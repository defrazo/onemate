import { observer } from 'mobx-react-lite';

import { useStore } from '@/app/providers';
import LocationSearch from '@/features/location/ui/LocationSearch';
import { WIDGET_TIPS } from '@/shared/content';
import { Button, ErrorFallback, LoadFallback, Tooltip } from '@/shared/ui';

import { Current, Forecast } from '.';

const WeatherWidget = () => {
	const { cityStore, weatherStore: store } = useStore();

	return (
		<>
			<div className="flex items-center">
				<Tooltip content={WIDGET_TIPS.weather}>
					<h1 className="core-header">Погода</h1>
				</Tooltip>
			</div>
			{!store.isReady ? (
				<ErrorFallback onRetry={() => cityStore.restart()} />
			) : (
				<div className="flex h-full flex-col justify-between">
					<LocationSearch />
					{store.isRefresh ? (
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
					<Button className="w-full text-sm" onClick={() => store.setIsOpenCurrent()}>
						{store.isOpenCurrent ? 'Прогноз на 5 дней' : 'Текущая погода'}
					</Button>
				</div>
			)}
		</>
	);
};

export default observer(WeatherWidget);
