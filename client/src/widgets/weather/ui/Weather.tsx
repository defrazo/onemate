import { IconRefresh } from '@tabler/icons-react';
import { observer } from 'mobx-react-lite';

import { useStore } from '@/app/providers';
import { LocationSearch } from '@/features/location-search';
import { cn } from '@/shared/lib/utils';
import { Button, LoadingState, SegmentedControl } from '@/shared/ui';

import { Current, Forecast } from './components';

export const Weather = observer(() => {
	const { notifyStore, weatherStore } = useStore();

	return (
		<div className="flex h-full min-h-0 flex-col">
			<LocationSearch
				showGeolocation
				loading={weatherStore.isLoading && !weatherStore.location}
				value={weatherStore.location}
				onSelect={(city) => weatherStore.setLocation(city)}
			/>
			{!weatherStore.isReady ? (
				<LoadingState size="lg" />
			) : weatherStore.view === 'current' ? (
				<Current />
			) : (
				<Forecast />
			)}
			<div className="flex items-center">
				<SegmentedControl
					className="-mr-4 ml-auto w-60 shrink-0"
					options={[
						{ value: 'current', label: 'Сейчас' },
						{ value: 'forecast', label: '5 дней' },
					]}
					value={weatherStore.view}
					onChange={(view) => weatherStore.setView(view)}
				/>
				<Button
					centerIcon={
						<IconRefresh
							className={cn(
								'size-4 opacity-0',
								weatherStore.isInitialized && 'opacity-100',
								weatherStore.isRefreshing && 'animate-spin'
							)}
						/>
					}
					className="ml-auto transition-opacity group-hover:opacity-100 xl:opacity-0"
					disabled={weatherStore.isLoading || !weatherStore.isReady}
					padding="none"
					title="Обновить погоду"
					variant="icon"
					onClick={() => {
						void weatherStore
							.reload()
							.then(() => notifyStore.setNotice('Погода обновлена', 'success'))
							.catch(() => notifyStore.setNotice('Не удалось обновить погоду', 'error'));
					}}
				/>
			</div>
		</div>
	);
});
