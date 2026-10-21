/**
 * useResponsive – хук для определения типа устройства и его ориентации.
 *
 * Объединяет useDeviceType и useOrientation и предоставляет готовые
 * состояния для адаптации интерфейса под разные устройства.
 *
 * Планшет в портретной ориентации считается мобильным интерфейсом.
 *
 * @returns {
 *   device,
 *   orientation,
 *   isMobile,
 *   isTablet,
 *   isDesktop,
 *   isPortrait,
 *   isLandscape,
 *   isMobileLandscape
 * }
 *
 * Пример:
 *   const { isMobile, isLandscape } = useResponsive();
 *
 *   return isMobile ? <MobileView /> : <DesktopView />;
 */

import { useDeviceType, useOrientation } from '.';

export const useResponsive = () => {
	const device = useDeviceType();
	const orientation = useOrientation();

	const isMobile = device === 'mobile' || (device === 'tablet' && orientation === 'portrait');
	const isTablet = device === 'tablet';
	const isDesktop = device === 'desktop';

	const isPortrait = orientation === 'portrait';
	const isLandscape = orientation === 'landscape';

	const isMobileLandscape = device === 'mobile' && isLandscape;

	return {
		device,
		orientation,
		isMobile,
		isTablet,
		isDesktop,
		isPortrait,
		isLandscape,
		isMobileLandscape,
	};
};
