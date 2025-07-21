import { makeAutoObservable, runInAction } from 'mobx';

import { collectDeviceInfo } from '../lib';
import type { ActivityLog, DeviceData } from '.';
import { deviceActivityService } from '.';

export class DeviceActivityStore {
	activityLog: ActivityLog[] = [];
	deviceInfo: DeviceData | null = null;

	get ip() {
		return this.deviceInfo?.ip || '';
	}

	get city() {
		return this.deviceInfo?.city || '';
	}

	get region() {
		return this.deviceInfo?.region || '';
	}

	get browser() {
		return this.deviceInfo?.browser || '';
	}

	get isMobile() {
		return this.deviceInfo?.isMobile || false;
	}

	setDeviceInfo(info: Partial<DeviceData>): void {
		if (this.deviceInfo) this.deviceInfo = { ...this.deviceInfo, ...info };
		else this.deviceInfo = { ...info } as DeviceData;
	}

	async logAuthOnce() {
		try {
			const device = await collectDeviceInfo();

			await deviceActivityService.saveActivityLog({
				ip_address: device.ip,
				city: device.city,
				region: device.region || '',
				browser: device.browser,
				is_mobile: device.isMobile,
			});
		} catch {}
	}

	async setupDeviceLog(): Promise<void> {
		try {
			const [logs, device] = await Promise.all([deviceActivityService.loadActivityLog(), collectDeviceInfo()]);

			runInAction(() => {
				this.activityLog = logs.slice(0, 10);
				this.setDeviceInfo(device);
			});
		} catch {
			runInAction(() => {
				this.activityLog = [];
			});
		}
	}

	constructor() {
		makeAutoObservable(this);
	}
}

export const deviceActivityStore = new DeviceActivityStore();
