import { useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';

import { useStore } from '@/app/providers';
import type { City } from '@/entities/city';
import { IconLocation } from '@/shared/assets/icons';
import { Input, Preloader, SuggestionList } from '@/shared/ui';

import { LocationSearchStore } from '../model';

interface LocationSearchProps {
	value: City | null;
	onSelect: (city: City) => void | Promise<void>;
	validate?: (city: City) => void | Promise<void>;
}

const LocationSearch = ({ value, onSelect, validate }: LocationSearchProps) => {
	const { notifyStore } = useStore();

	const [store] = useState(() => new LocationSearchStore());

	const handleSelect = async (city: City) => {
		try {
			if (validate) await validate(city);

			await onSelect(city);

			store.selectCity(city);

			notifyStore.setNotice(`Выбран город: ${city.name}`, 'success');
		} catch (error) {
			notifyStore.setNotice(error instanceof Error ? error.message : 'Произошла ошибка', 'error');
		}
	};

	const handleGeolocation = async () => {
		try {
			const city = await store.detectCityByGeolocation();

			if (validate) await validate(city);

			await onSelect(city);

			store.selectCity(city);

			notifyStore.setNotice(`Выбран город: ${city.name}`, 'success');
		} catch (error) {
			notifyStore.setNotice(error instanceof Error ? error.message : 'Произошла ошибка', 'error');
		}
	};

	useEffect(() => {
		store.init();
		return () => store.destroy();
	}, [store]);

	useEffect(() => {
		store.setValue(value);
	}, [store, value]);

	return (
		<div className="relative w-full">
			<Input
				autoComplete="off"
				className="bg-(--bg-secondary)"
				name="fake-location"
				placeholder="Введите город"
				rightIcon={
					store.isLoading ? (
						<Preloader className="size-7 border-(--border-alt) border-t-(--bg-tertiary)" />
					) : (
						<IconLocation
							className="size-7 cursor-pointer hover:text-(--accent-hover)"
							onClick={() => void handleGeolocation()}
						/>
					)
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
						onClick={() => void handleSelect(city)}
						onPointerDown={() => store.startSelecting()}
						onPointerUp={() => store.finishSelecting()}
					>
						<strong>{city.name}</strong> <span>{city.region && `(${city.region})`}</span>
					</div>
				)}
			/>
		</div>
	);
};

export default observer(LocationSearch);
