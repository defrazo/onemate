// import { useCallback } from 'react';

// import { fetchCityByCoordinates } from '@/entities/city';

// export const getCityByLocation = useCallback(() => {
// 	if (!navigator.geolocation) {
// 		setError('Геолокация не поддерживается вашим браузером');
// 		return;
// 	}

// 	navigator.geolocation.getCurrentPosition(
// 		async (position) => {
// 			setIsLoading(true);
// 			setError(null);

// 			try {
// 				const { latitude, longitude } = position.coords;

// 				const city = await fetchCityByCoordinates(latitude, longitude);
// 				if (city) handleCitySelect(city);
// 				// console.log(city);
// 			} catch {
// 				setError('Ошибка при определении текущего местоположения');
// 			} finally {
// 				setIsLoading(false);
// 			}
// 		},
// 		() => {
// 			setError('Не удалось получить геолокацию');
// 			setIsLoading(false);
// 		}
// 	);
// }, []);
