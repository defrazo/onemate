import { observer } from 'mobx-react-lite';

import { useStore } from '@/app/providers';
import { LocationSearch } from '@/features/location-search';
import { LoadingState } from '@/shared/ui';

import { Current, Forecast, ViewSwitch } from './components';

export const Weather = observer(() => {
	const { weatherStore } = useStore();

	return (
		<div className="flex h-full flex-col">
			<LocationSearch
				showGeolocation
				value={weatherStore.location}
				onSelect={(city) => weatherStore.setLocation(city)}
			/>
			{weatherStore.isLoading && !weatherStore.isReady ? (
				<LoadingState size="lg" />
			) : weatherStore.isOpenCurrent ? (
				<Current />
			) : (
				<Forecast />
			)}
			<ViewSwitch />
		</div>
	);
});
