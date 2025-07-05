import { useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';

import { cityStore } from '@/entities/city';
import { Input, SuggestionList } from '@/shared/ui';

import { searchCityStore } from '../model';
import { AutoLocation } from '.';

const SearchCity = () => {
	const [isInputFocused, setInputFocused] = useState(false);
	const store = searchCityStore;

	useEffect(() => {
		if (isInputFocused && store.query.length >= 3) store.fetchCities(store.query);
		else store.resetResults();
	}, [store.query, isInputFocused]);

	useEffect(() => {
		store.setQuery(cityStore.currentCity.name);
	}, [cityStore.currentCity.name]);

	const handleFocus = () => {
		setInputFocused(true);
		if (store.query === cityStore.currentCity.name) store.setQuery('');
	};

	const handleBlur = () => {
		setInputFocused(false);

		if (store.query.trim() === '') store.setQuery(cityStore.currentCity.name);

		setTimeout(() => {
			store.resetResults();
		}, 100);
	};

	return (
		<div className="relative">
			<Input
				className="z-10 bg-[var(--bg-secondary)]"
				placeholder="Введите город"
				value={store.query}
				variant="ghost"
				onBlur={handleBlur}
				onChange={(e) => store.setQuery(e.target.value)}
				onFocus={handleFocus}
			/>
			<SuggestionList
				items={store.searchResults}
				renderItem={(city) => (
					<div>
						<strong>{city.name}</strong> <span>{city.region && `(${city.region})`}</span>
					</div>
				)}
				onSelect={(city) => store.selectCity(city)}
			/>
			<AutoLocation />
		</div>
	);
};

export default observer(SearchCity);
