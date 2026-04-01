type DeviceType = 'mobile' | 'tablet' | 'desktop';
type DeviceOrientation = 'portrait' | 'landscape';

let currentDevice: DeviceType = typeof window !== 'undefined' ? getDeviceType() : 'desktop';
let currentOrientation: DeviceOrientation = typeof window !== 'undefined' ? getOrientation() : 'portrait';

const deviceListeners: ((device: DeviceType) => void)[] = [];
const orientationListeners: ((orientation: DeviceOrientation) => void)[] = [];

function initDeviceListener() {
	if (typeof window === 'undefined') return;

	currentDevice = getDeviceType();
	currentOrientation = getOrientation();

	window.addEventListener('resize', () => {
		const newDevice = getDeviceType();

		if (newDevice !== currentDevice) {
			currentDevice = newDevice;
			deviceListeners.forEach((callback) => callback(currentDevice));
		}
	});

	const portraitQuery = window.matchMedia('(orientation: portrait)');
	const orientationChange = (event: MediaQueryListEvent) => {
		currentOrientation = event.matches ? 'portrait' : 'landscape';
		orientationListeners.forEach((callback) => callback(currentOrientation));
	};

	portraitQuery.addEventListener('change', orientationChange);
}

function getDeviceType(): DeviceType {
	const width = window.innerWidth;
	const ua = navigator.userAgent;

	const isIpad = /iPad/.test(ua) || (ua.includes('Macintosh') && 'ontouchend' in window);

	if (isIpad) return width >= 1280 ? 'desktop' : 'tablet';

	if (width <= 767) return 'mobile';
	if (width <= 1023) return 'tablet';
	return 'desktop';
}

function getOrientation(): DeviceOrientation {
	return window.matchMedia('(orientation: portrait)').matches ? 'portrait' : 'landscape';
}

export const deviceUtils = {
	init: initDeviceListener,
	getDevice: () => currentDevice,
	getOrientation: () => currentOrientation,
	onDeviceChange: (callback: (device: DeviceType) => void) => deviceListeners.push(callback),
	onOrientationChange: (callback: (orientation: DeviceOrientation) => void) => orientationListeners.push(callback),
};
