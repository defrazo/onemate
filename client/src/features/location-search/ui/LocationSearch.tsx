import { useEffect, useState } from 'react';
import { IconMapPinFilled, IconTrashFilled } from '@tabler/icons-react';
import { observer } from 'mobx-react-lite';

import { useStore } from '@/app/providers';
import type { City } from '@/entities/city';
import { InputLabel } from '@/features/user-auth';
import { IconLocation } from '@/shared/assets/icons';
import { Input, Preloader, SuggestionList } from '@/shared/ui';

import { LocationSearchStore } from '../model';

interface LocationSearchProps {
	value: City | null;
	showGeolocation?: boolean;
	onRemove?: () => void;
	validate?: (city: City) => void | Promise<void>;
	onSelect: (city: City) => void | Promise<void>;
}

const LocationSearch = ({ value, showGeolocation, onRemove, validate, onSelect }: LocationSearchProps) => {
	const { notifyStore } = useStore();

	const [store] = useState(() => new LocationSearchStore());

	const handleSelect = async (city: City) => {
		try {
			if (validate) await validate(city);

			await onSelect(city);

			store.selectCity(city);
			notifyStore.setNotice(`Выбран город: ${city.name}`, 'success');
		} catch {
			notifyStore.setNotice('Что-то пошло не так', 'error');
		}
	};

	const handleGeolocation = async () => {
		try {
			const city = await store.detectCityByGeolocation();

			if (validate) await validate(city);

			await onSelect(city);

			store.selectCity(city);
			notifyStore.setNotice(`Выбран город: ${city.name}`, 'success');
		} catch {
			notifyStore.setNotice('Что-то пошло не так', 'error');
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
				id="location"
				leftIcon={<InputLabel htmlFor="location" icon={IconMapPinFilled} />}
				name="fake-location"
				placeholder="Введите город"
				rightIcon={
					store.isLoading ? (
						<Preloader className="size-7 border-(--border-alt) border-t-(--bg-tertiary)" />
					) : onRemove && value ? (
						<IconTrashFilled
							className="mr-1 ml-1.5 size-5.5 cursor-pointer opacity-50 transition-all hover:text-(--status-error) hover:opacity-100"
							onClick={onRemove}
						/>
					) : showGeolocation ? (
						<IconLocation
							className="size-7 cursor-pointer hover:text-(--accent-hover)"
							onClick={() => void handleGeolocation()}
						/>
					) : null
				}
				spellCheck={false}
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
						<div className="flex flex-col">
							<span className="font-medium">{city.name}</span>
							<div className="flex items-center gap-2 text-sm text-(--color-secondary) opacity-60">
								<span className="truncate">{city.region || 'Регион не указан'}</span>
								<div className="flex h-5 items-center rounded-md bg-(--accent-default)/12 px-1.5 text-[11px] font-medium text-(--accent-default)">
									<span className="trim">{city.country}</span>
								</div>
							</div>
						</div>
					</div>
				)}
			/>
		</div>
	);
};

export default observer(LocationSearch);
