import { fetchCityByIP } from '@/entities/city';
import { getBrowserInfo } from '@/shared/lib/utils';

import type { DeviceData, IDeviceProvider } from '../../model';
import { fetchIP } from '..';

export class DeviceProviderApi implements IDeviceProvider {
	private ipCache: string | null = null;

	async getDeviceData(): Promise<DeviceData> {
		let ip = this.ipCache;

		if (!ip) {
			try {
				ip = await fetchIP();
				this.ipCache = ip;
			} catch {
				ip = '0.0.0.0';
			}
		}

		let city = '';
		let region = '';

		try {
			const location = await fetchCityByIP();

			if (location) {
				city = location.name;
				region = location.region ?? '';
			}
		} catch {}

		let browser = 'Unknown';
		let isMobile = false;

		try {
			const info = getBrowserInfo();

			browser = info.browser ?? 'Unknown';
			isMobile = !!info.isPhone;
		} catch {}

		return { ip, city, region, browser, isMobile };
	}
}
