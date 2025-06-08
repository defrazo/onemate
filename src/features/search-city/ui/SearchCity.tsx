import { useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';

import { City, CityLocation, cityStore } from '@/entities/city';
import { appStore } from '@/shared/store/appStore';
import { Input, SuggestionList } from '@/shared/ui';

import { checkWeatherAvailability } from '../api';
import { searchCityStore } from '../model';

const SearchCity = () => {
	const [isInputFocused, setInputFocused] = useState(false);

	useEffect(() => {
		const controller = new AbortController();

		if (isInputFocused && searchCityStore.query.length >= 3) {
			searchCityStore.fetchCities(searchCityStore.query, controller.signal);
		} else {
			searchCityStore.resetResults();
		}

		return () => controller.abort();
	}, [searchCityStore.query, isInputFocused]);

	const handleSelect = async (city: City) => {
		const hasWeather = await checkWeatherAvailability(city.lat, city.lon);
		if (!hasWeather) {
			appStore.setError(`Прогноз для этого города недоступен`);
			return;
		}
		cityStore.setCurrentCity(city);

		appStore.setSuccess(`Выбран город: ${city.name}`);
		searchCityStore.setQuery(city.name);
		searchCityStore.resetResults();
	};

	useEffect(() => {
		searchCityStore.setQuery(cityStore.currentCity.name);
	}, [cityStore.currentCity.name]);

	const handleFocus = () => {
		setInputFocused(true);
		if (searchCityStore.query === cityStore.currentCity.name) {
			searchCityStore.setQuery('');
		}
	};

	const handleBlur = () => {
		setInputFocused(false);

		if (searchCityStore.query.trim() === '') {
			searchCityStore.setQuery(cityStore.currentCity.name);
		}

		setTimeout(() => {
			searchCityStore.resetResults();
		}, 100);
	};

	return (
		<div className="relative">
			<Input
				placeholder="Введите город"
				value={searchCityStore.query}
				variant="ghost"
				onBlur={handleBlur}
				onChange={(e) => searchCityStore.setQuery(e.target.value)}
				onFocus={handleFocus}
			/>
			<SuggestionList
				items={searchCityStore.searchResults}
				renderItem={(city) => (
					<div>
						<strong>{city.name}</strong>{' '}
						<span className="text-muted-foreground text-sm">{city.region && `(${city.region})`}</span>
					</div>
				)}
				onSelect={handleSelect}
			/>
			<CityLocation />
		</div>
	);
};

export default observer(SearchCity);
