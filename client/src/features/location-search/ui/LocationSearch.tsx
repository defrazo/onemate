import { useEffect, useState } from 'react';
import { IconTrash } from '@tabler/icons-react';
import { observer } from 'mobx-react-lite';

import { useStore } from '@/app/providers';
import type { City } from '@/entities/city';
import { IconLocation } from '@/shared/assets/icons';
import { cn } from '@/shared/lib/utils';
import { Input, LoadingState } from '@/shared/ui';

import { LocationSearchStore } from '../model';
import { Suggestions } from './components';

interface LocationSearchProps {
	value: City | null;
	showGeolocation?: boolean;
	onRemove?: () => void;
	validate?: (city: City) => void | Promise<void>;
	onSelect: (city: City) => void | Promise<void>;
	className?: string;
}

export const LocationSearch = observer(
	({ value, showGeolocation, onRemove, validate, onSelect, className }: LocationSearchProps) => {
		const { notifyStore, userProfileStore } = useStore();

		const [store] = useState(() => new LocationSearchStore());

		const isLoading = !userProfileStore.isReady || store.isLoading;

		const handleSelect = async (city: City) => {
			const previousCity = value;

			store.selectCity(city);

			try {
				if (validate) await validate(city);

				await onSelect(city);
				notifyStore.setNotice(`Выбран город: ${city.name}`, 'success');
			} catch {
				store.setValue(previousCity);
				notifyStore.setNotice('Что-то пошло не так', 'error');
			}
		};

		const handleGeolocation = async () => {
			try {
				const city = await store.detectCityByGeolocation();

				await handleSelect(city);
				notifyStore.setNotice(`Определен город: ${city.name}`, 'success');
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
					className={cn('not-lg:text-base', className)}
					disabled={!userProfileStore.isReady}
					id="location"
					name="fake-location"
					placeholder={isLoading ? 'Загрузка города...' : 'Введите город'}
					rightIcon={
						isLoading ? (
							<LoadingState className="mr-1" size="sm" />
						) : onRemove && value ? (
							<IconTrash
								className="mr-1 ml-1.5 size-5.5 cursor-pointer text-(--text-primary)/80 opacity-50 transition-[color,opacity] hover:text-(--status-error) hover:opacity-100"
								onClick={onRemove}
							/>
						) : showGeolocation ? (
							<IconLocation
								className="size-7 cursor-pointer text-(--text-primary)/80 transition-colors hover:text-(--accent-primary-hover)"
								onClick={() => void handleGeolocation()}
							/>
						) : null
					}
					spellCheck={false}
					value={store.inputValue}
					variant="tone"
					onBlur={() => store.setFocused(false)}
					onChange={(e) => store.setQuery(e.target.value)}
					onFocus={() => store.setFocused(true)}
				/>
				<Suggestions cities={store.searchResults} onSelect={handleSelect} />
			</div>
		);
	}
);
