type DeviceType = 'mobile' | 'tablet' | 'desktop';
type DeviceOrientation = 'portrait' | 'landscape';

let currentDevice: DeviceType = typeof window !== 'undefined' ? getDeviceType() : 'desktop';
let currentOrientation: DeviceOrientation = typeof window !== 'undefined' ? getOrientation() : 'portrait';

const deviceListeners: ((device: DeviceType) => void)[] = [];
const orientationListeners: ((orientation: DeviceOrientation) => void)[] = [];

let isInitialized = false;
let cleanupGlobalListeners: (() => void) | null = null;

function initDeviceListener() {
	if (typeof window === 'undefined') return;
	if (isInitialized) return;

	isInitialized = true;

	currentDevice = getDeviceType();
	currentOrientation = getOrientation();

	const onResize = () => {
		const newDevice = getDeviceType();

		if (newDevice !== currentDevice) {
			currentDevice = newDevice;
			deviceListeners.forEach((callback) => callback(currentDevice));
		}
	};

	const portraitQuery = window.matchMedia('(orientation: portrait)');

	const onOrientationChange = (event: MediaQueryListEvent) => {
		currentOrientation = event.matches ? 'portrait' : 'landscape';
		orientationListeners.forEach((callback) => callback(currentOrientation));
	};

	window.addEventListener('resize', onResize);
	portraitQuery.addEventListener('change', onOrientationChange);

	cleanupGlobalListeners = () => {
		window.removeEventListener('resize', onResize);
		portraitQuery.removeEventListener('change', onOrientationChange);
		isInitialized = false;
		cleanupGlobalListeners = null;
	};
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

function subscribeDeviceChange(callback: (device: DeviceType) => void) {
	deviceListeners.push(callback);

	return () => {
		const index = deviceListeners.indexOf(callback);
		if (index !== -1) deviceListeners.splice(index, 1);
	};
}

function subscribeOrientationChange(callback: (orientation: DeviceOrientation) => void) {
	orientationListeners.push(callback);

	return () => {
		const index = orientationListeners.indexOf(callback);
		if (index !== -1) orientationListeners.splice(index, 1);
	};
}

export const deviceUtils = {
	init: initDeviceListener,
	destroy: () => cleanupGlobalListeners?.(),
	getDevice: () => currentDevice,
	getOrientation: () => currentOrientation,
	onDeviceChange: subscribeDeviceChange,
	onOrientationChange: subscribeOrientationChange,
};
