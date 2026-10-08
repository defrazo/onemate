import type { City } from '@/entities/city';
import { api } from '@/shared/api';
import { getBrowserInfo } from '@/shared/lib/utils';

import type { DeviceData, IDeviceProvider } from '../../model';

export class DeviceProviderApi implements IDeviceProvider {
	async getDeviceData(): Promise<DeviceData> {
		let ip = '0.0.0.0';
		let city = '';
		let region = '';

		try {
			const { data } = await api.get<{ ip: string; location: City | null }>('/user/location/detect');

			ip = data.ip;
			city = data.location?.name ?? '';
			region = data.location?.region ?? '';
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
