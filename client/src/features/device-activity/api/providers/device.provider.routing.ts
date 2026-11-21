import type { UserStore } from '@/entities/user';
import { BaseRouting } from '@/shared/lib/repository';

import type { IDeviceProvider } from '../../model/ports';
import type { DeviceData } from '../../model/types';
import { DeviceProviderDemo } from './device.provider.demo';
import { DeviceProviderApi } from './device.provider.real';

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

	async getDeviceData(): Promise<DeviceData> {
		this.checkPermission('device', 'read');
		return this.getTargetProvider().getDeviceData();
	}
}
