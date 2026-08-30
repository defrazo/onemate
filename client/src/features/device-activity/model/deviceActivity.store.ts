import { action, computed, makeObservable, observable, reaction } from 'mobx';

import type { IBaseUserPort } from '@/entities/user';
import type { IAuthDevicePort } from '@/features/user-auth';
import { storage } from '@/shared/lib/storage';
import { AsyncStore } from '@/shared/lib/store';
import { key } from '@/shared/lib/utils';

import type { ActivityLog, DeviceData, IActivityRepo, IDeviceProvider } from '.';

export class DeviceActivityStore extends AsyncStore {
	private lastProcessedAuthTime = 0;

	activityLog: ActivityLog[] = [];
	deviceInfo: DeviceData | null = null;

	get isReady(): boolean {
		return this.deviceInfo !== null;
	}

	get ip(): string {
		return this.deviceInfo?.ip ?? '';
	}

	get city(): string {
		return this.deviceInfo?.city ?? '';
	}

	get region(): string {
		return this.deviceInfo?.region ?? '';
	}

	get browser(): string {
		return this.deviceInfo?.browser ?? '';
	}

	get isMobile(): boolean {
		return this.deviceInfo?.isMobile ?? false;
	}

	async deleteLogAuth(): Promise<void> {
		const userId = this.userStore.id;
		if (!userId || this.isLoading) return;

		await this.withLoading(async () => {
			await this.repo.deleteActivityLog(userId);
			this.applyActivityLog([]);
		});
	}

	private async load(userId: string): Promise<void> {
		if (this.isLoading) return;

		await this.withLoading(async () => {
			const [deviceInfo, activityLog] = await Promise.all([
				this.provider.getDeviceData(),
				this.repo.loadActivityLog(userId),
			]);

			this.applyDeviceInfo(deviceInfo);
			this.applyActivityLog(activityLog);
		});
	}

	private async logAuthOnce(userId: string, authTime: number): Promise<void> {
		const deviceInfo = this.deviceInfo;

		if (!deviceInfo || this.isLoading || authTime <= this.lastProcessedAuthTime) return;

		this.lastProcessedAuthTime = authTime;

		await this.withLoading(async () => {
			await this.repo.saveActivityLog(userId, {
				ip_address: deviceInfo.ip,
				city: deviceInfo.city,
				region: deviceInfo.region ?? '',
				browser: deviceInfo.browser,
				is_mobile: deviceInfo.isMobile,
			});

			const activityLog = await this.repo.loadActivityLog(userId);
			this.applyActivityLog(activityLog);
		});
	}

	private applyDeviceInfo(deviceInfo: DeviceData): void {
		this.deviceInfo = deviceInfo;
	}

	private applyActivityLog(activityLog: ActivityLog[]): void {
		this.activityLog = activityLog;
	}

	constructor(
		private readonly userStore: IBaseUserPort,
		private readonly authStore: IAuthDevicePort,
		private readonly repo: IActivityRepo,
		private readonly provider: IDeviceProvider
	) {
		super();

		makeObservable<this, 'applyDeviceInfo' | 'applyActivityLog' | 'reset'>(this, {
			activityLog: observable,
			deviceInfo: observable,

			isReady: computed,
			ip: computed,
			city: computed,
			region: computed,
			browser: computed,
			isMobile: computed,

			applyDeviceInfo: action,
			applyActivityLog: action,
			reset: action,
		});
	}

	init(): void {
		if (this.inited) return;
		this.inited = true;

		this.track(
			reaction(
				() => this.userStore.id,
				(userId) => {
					if (!userId) {
						this.reset();
						return;
					}

					void this.load(userId);
				},
				{ fireImmediately: true }
			)
		);

		this.track(
			reaction(
				() =>
					[
						this.authStore.lastAuthTime,
						this.authStore.isReady,
						this.deviceInfo !== null,
						this.userStore.id,
						this.isLoading,
					] as const,
				([authTime, isAuthReady, hasDeviceInfo, userId, isLoading]) => {
					if (
						authTime <= 0 ||
						authTime <= this.lastProcessedAuthTime ||
						!isAuthReady ||
						!hasDeviceInfo ||
						!userId ||
						isLoading
					) {
						return;
					}

					void this.logAuthOnce(userId, authTime);
				},
				{ fireImmediately: true }
			)
		);
	}

	protected reset(): void {
		this.deviceInfo = null;
		this.activityLog = [];
		this.lastProcessedAuthTime = 0;

		if (this.userStore.lastId) storage.remove(key(this.userStore.lastId, 'activity'));
	}
}
