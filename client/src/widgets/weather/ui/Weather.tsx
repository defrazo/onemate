import { observer } from 'mobx-react-lite';

import { useStore } from '@/app/providers';
import { LocationSearch } from '@/features/location-search';
import { LoadingState, SegmentedControl } from '@/shared/ui';

import { Current, Forecast } from './components';

export const Weather = observer(() => {
	const { weatherStore } = useStore();

	return (
		<div className="flex h-full min-h-0 flex-col">
			<LocationSearch
				showGeolocation
				value={weatherStore.location}
				onSelect={(city) => weatherStore.setLocation(city)}
			/>
			{weatherStore.isLoading || !weatherStore.isReady ? (
				<LoadingState size="lg" />
			) : weatherStore.view === 'current' ? (
				<Current />
			) : (
				<Forecast />
			)}
			<SegmentedControl
				className="mx-auto w-60 shrink-0"
				options={[
					{ value: 'current', label: 'Сейчас' },
					{ value: 'forecast', label: '5 дней' },
				]}
				value={weatherStore.view}
				onChange={(view) => weatherStore.setView(view)}
			/>
		</div>
	);
});
