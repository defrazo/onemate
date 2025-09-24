/**
 * useOrientation – хук для отслеживания ориентации экрана.
 *
 * Определяет, находится ли устройство в портретном или альбомном режиме,
 * и возвращает соответствующее значение ('portrait' | 'landscape').
 * Реагирует на изменения ориентации с помощью matchMedia.
 *
 * @returns 'portrait' | 'landscape' – текущая ориентация устройства
 */

import { useEffect, useState } from 'react';

export const useOrientation = () => {
	const [orientation, setOrientation] = useState<'portrait' | 'landscape'>(
		window.matchMedia('(orientation: portrait)').matches ? 'portrait' : 'landscape'
	);

	useEffect(() => {
		const portraitQuery = window.matchMedia('(orientation: portrait)');
		const listener = (e: MediaQueryListEvent) => setOrientation(e.matches ? 'portrait' : 'landscape');

		portraitQuery.addEventListener('change', listener);
		return () => portraitQuery.removeEventListener('change', listener);
	}, []);

	return orientation;
};
