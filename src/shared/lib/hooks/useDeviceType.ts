/**
 * useIsMobile – хук для определения типа устройства у пользователя.
 *
 * Считывает текущую ширину окна устройства и возвращает соответствующий тип.
 * iPad считывается отдельно. Также реагирует на изменение размера окна.
 */

import { useEffect, useState } from 'react';

type DeviceType = 'mobile' | 'tablet' | 'desktop';

const getDeviceType = (): DeviceType => {
	const width = window.innerWidth;
	const ua = navigator.userAgent;

	const isIpad = /iPad/.test(ua) || (ua.includes('Macintosh') && 'ontouchend' in window);

	if (isIpad) return width >= 1280 ? 'desktop' : 'tablet';
	if (width <= 767) return 'mobile';
	if (width <= 1023) return 'tablet';
	return 'desktop';
};

export const useDeviceType = (): DeviceType => {
	const [device, setDevice] = useState<DeviceType>(() => getDeviceType());

	useEffect(() => {
		const handleResize = () => setDevice(getDeviceType());
		handleResize();
		window.addEventListener('resize', handleResize);
		return () => window.removeEventListener('resize', handleResize);
	}, []);

	return device;
};
