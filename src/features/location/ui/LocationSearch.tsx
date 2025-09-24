import { observer } from 'mobx-react-lite';

import { useStore } from '@/app/providers';
import type { City } from '@/entities/city';
import { IconLocation } from '@/shared/assets/icons';
import { Input, SuggestionList } from '@/shared/ui';

import { useLocationChannel } from '../model';

const LocationSearch = () => {
	const { locationStore: store, notifyStore } = useStore();

	useLocationChannel();

	const handleSelect = async (city: City) => {
		try {
			await store.selectCity(city);
			notifyStore.setNotice(`Выбран город: ${city.name}`, 'success');
		} catch (error: any) {
			notifyStore.setNotice(error.message || 'Произошла ошибка', 'error');
		}
	};

	const handleGeolocation = async () => {
		try {
			const city = await store.detectCityByGeolocation();
			notifyStore.setNotice(`Выбран город: ${city.name}`, 'success');
		} catch (error: any) {
			notifyStore.setNotice(error.message || 'Произошла ошибка', 'error');
		}
	};

	return (
		<div className="relative w-full">
			<Input
				autoComplete="off"
				className="bg-[var(--bg-secondary)]"
				name="fake-location"
				placeholder="Введите город"
				rightIcon={
					<IconLocation
						className="size-7 cursor-pointer hover:text-[var(--accent-hover)]"
						onClick={() => handleGeolocation()}
					/>
				}
				value={store.inputValue}
				variant="ghost"
				onBlur={() => store.setFocused(false)}
				onChange={(e) => store.setQuery(e.target.value)}
				onFocus={() => store.setFocused(true)}
			/>
			<SuggestionList
				items={store.searchResults}
				renderItem={(city) => (
					<div
						onClick={async () => {
							try {
								await handleSelect(city);
							} finally {
								store.finishSelecting();
							}
						}}
						onPointerDown={() => store.startSelecting()}
					>
						<strong>{city.name}</strong> <span>{city.region && `(${city.region})`}</span>
					</div>
				)}
			/>
		</div>
	);
};

export default observer(LocationSearch);
