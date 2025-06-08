import { fetchCityByCoordinates, fetchCityByIP } from '../api';

export const getCityByIP = async () => {
	try {
		const responseCity = await fetchCityByIP();
		if (!responseCity) return;

		const cityByCoords = await fetchCityByCoordinates(responseCity.lat, responseCity.lon);
		if (cityByCoords) handleCitySelect(cityByCoords);
	} catch (error) {
		console.error('Ошибка получения города по IP:', error);
	}
};
