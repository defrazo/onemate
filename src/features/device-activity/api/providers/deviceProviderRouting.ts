import type { City } from '@/entities/city';
import type { UserStore } from '@/entities/user';
import { BaseRouting } from '@/shared/lib/repository';

import type { DeviceData, IDeviceProvider } from '../../model';
import { DeviceProviderApi, DeviceProviderDemo } from '.';

export class DeviceProviderRouting extends BaseRouting implements IDeviceProvider {
	private readonly realProvider: IDeviceProvider;
	private readonly demoProvider: IDeviceProvider;

	constructor(userStore: UserStore) {
		super(userStore);
		this.realProvider = new DeviceProviderApi();
		this.demoProvider = new DeviceProviderDemo();
	}

	private getTargetProvider(): IDeviceProvider {
		return this.role === 'demo' ? this.demoProvider : this.realProvider;
	}

	async getDeviceData(city: City): Promise<DeviceData> {
		this.checkPermission('device', 'read');
		return this.getTargetProvider().getDeviceData(city);
	}
}
