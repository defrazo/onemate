import { cityStore } from '@/entities/city';
import { getBrowserInfo } from '@/shared/lib/utils';

import { getIP } from '../api';

export async function collectDeviceInfo() {
	const ip = await getIP();
	const { name, region } = cityStore.currentCity;
	const { browser, isPhone } = getBrowserInfo();

	return { ip, city: name, region, browser, isMobile: isPhone };
}
