import { getBrowserInfo } from '@/shared/lib/utils';

import type { DeviceData, IDeviceProvider } from '../../model';
import { fakeIP, fakeLocation } from '..';

export class DeviceProviderDemo implements IDeviceProvider {
	async getDeviceData(): Promise<DeviceData> {
		let browser = 'Unknown';
		let isMobile = false;

		try {
			const info = getBrowserInfo();
			browser = info.browser ?? 'Unknown';
			isMobile = !!info.isPhone;
		} catch {}

		const location = fakeLocation();

		return { ip: fakeIP(), city: location.city, region: location.region, browser, isMobile };
	}
}
