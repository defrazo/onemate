type DeviceType = 'mobile' | 'tablet' | 'desktop';
type DeviceOrientation = 'portrait' | 'landscape';

type DeviceListener = (device: DeviceType) => void;
type OrientationListener = (orientation: DeviceOrientation) => void;

let currentDevice: DeviceType = typeof window !== 'undefined' ? getDeviceType() : 'desktop';
let currentOrientation: DeviceOrientation = typeof window !== 'undefined' ? getOrientation() : 'portrait';

const deviceListeners = new Set<DeviceListener>();
const orientationListeners = new Set<OrientationListener>();

let isInitialized = false;
let cleanupGlobalListeners: (() => void) | null = null;

function init() {
	if (typeof window === 'undefined') return;
	if (isInitialized) return;

	isInitialized = true;

	currentDevice = getDeviceType();
	currentOrientation = getOrientation();

	const onResize = () => {
		const nextDevice = getDeviceType();
		if (nextDevice === currentDevice) return;

		currentDevice = nextDevice;
		deviceListeners.forEach((listener) => listener(currentDevice));
	};

	const portraitQuery = window.matchMedia('(orientation: portrait)');

	const onOrientationChange = (event: MediaQueryListEvent) => {
		const nextOrientation: DeviceOrientation = event.matches ? 'portrait' : 'landscape';
		if (nextOrientation === currentOrientation) return;

		currentOrientation = nextOrientation;
		orientationListeners.forEach((listener) => listener(currentOrientation));
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

function destroy() {
	cleanupGlobalListeners?.();
}

function getDeviceType(): DeviceType {
	const width = window.innerWidth;
	const userAgent = navigator.userAgent;

	const isIpad = /iPad/.test(userAgent) || (userAgent.includes('Macintosh') && 'ontouchend' in window);

	if (isIpad) return width >= 1280 ? 'desktop' : 'tablet';
	if (width <= 767) return 'mobile';
	if (width <= 1023) return 'tablet';

	return 'desktop';
}

function getOrientation(): DeviceOrientation {
	return window.matchMedia('(orientation: portrait)').matches ? 'portrait' : 'landscape';
}

function onDeviceChange(listener: DeviceListener): () => void {
	deviceListeners.add(listener);
	return () => deviceListeners.delete(listener);
}

function onOrientationChange(listener: OrientationListener): () => void {
	orientationListeners.add(listener);
	return () => orientationListeners.delete(listener);
}

export const deviceUtils = {
	init,
	destroy,
	getDevice: () => currentDevice,
	getOrientation: () => currentOrientation,
	onDeviceChange,
	onOrientationChange,
};
