/**
 * useIsMobile – хук для определения мобильного устройства у пользователя.
 *
 * Считывает текущую ширину окна устройства и возвращает boolean флаг.
 * Также реагирует на изменение размера окна.
 */

import { useEffect, useState } from 'react';

export const useIsMobile = () => {
	const [isMobile, setIsMobile] = useState<boolean>(false);

	useEffect(() => {
		const check = () => setIsMobile(window.matchMedia('(max-width: 768px)').matches);

		check();
		window.addEventListener('resize', check);
		return () => window.removeEventListener('resize', check);
	}, []);

	return isMobile;
};
