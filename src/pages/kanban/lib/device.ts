type DeviceType = 'mobile' | 'tablet' | 'desktop';

let currentDevice: DeviceType = typeof window !== 'undefined' ? getDeviceType() : 'desktop';

const listeners: ((device: DeviceType) => void)[] = [];

function getDeviceType(): DeviceType {
	const width = window.innerWidth;
	const ua = navigator.userAgent;

	const isIpad = /iPad/.test(ua) || (ua.includes('Macintosh') && 'ontouchend' in window);

	if (isIpad) return width >= 1280 ? 'desktop' : 'tablet';

	if (width <= 767) return 'mobile';
	if (width <= 1023) return 'tablet';
	return 'desktop';
}

function initDeviceListener() {
	if (typeof window === 'undefined') return;

	currentDevice = getDeviceType();

	window.addEventListener('resize', () => {
		const newDevice = getDeviceType();

		if (newDevice !== currentDevice) {
			currentDevice = newDevice;
			listeners.forEach((callback) => callback(currentDevice));
		}
	});
}

export const deviceUtils = {
	init: initDeviceListener,
	getDevice: () => currentDevice,
	onChange: (callback: (device: DeviceType) => void) => listeners.push(callback),
};
