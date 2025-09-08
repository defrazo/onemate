import type { City } from '@/entities/city';
import { getBrowserInfo } from '@/shared/lib/utils';

import type { DeviceData, IDeviceProvider } from '../../model';
import { fakeIP } from '../demo';

export class DeviceProviderDemo implements IDeviceProvider {
	async getDeviceData(city: City): Promise<DeviceData> {
		const { name, region } = city;

		let browser = 'Unknown';
		let isMobile = false;

		try {
			const info = getBrowserInfo();
			browser = info.browser ?? 'Unknown';
			isMobile = !!info.isPhone;
		} catch {}

		return { ip: fakeIP(), city: name, region: region ?? '', browser, isMobile };
	}
}
