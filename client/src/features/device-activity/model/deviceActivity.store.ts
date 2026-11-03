import { action, computed, makeObservable, observable, reaction, runInAction } from 'mobx';

import type { IBaseUserPort } from '@/entities/user';
import type { IAuthDevicePort } from '@/features/auth';
import { storage } from '@/shared/lib/storage';
import { AsyncStore } from '@/shared/lib/store';
import { key } from '@/shared/lib/utils';

import type { ActivityLog, DeviceData, IActivityRepo, IDeviceProvider } from '.';

export class DeviceActivityStore extends AsyncStore {
	private initializing: Promise<void> | null = null;
	private generation = 0;
	private lastProcessedAuthTime = 0;
	private pendingAuthTime = 0;

	activityLog: ActivityLog[] = [];
	deviceInfo: DeviceData | null = null;
	isHistoryReady = false;

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

	get currentActivity(): ActivityLog | null {
		return this.activityLog[0] ?? null;
	}

	ensureLoaded(): Promise<void> {
		const userId = this.userStore.id;
		if (!userId || this.isHistoryReady) return Promise.resolve();

		if (this.initializing) return this.initializing;

		const generation = this.generation;

		const promise = this.withLoading(async () => {
			const activityLog = await this.repo.loadActivityLog(userId);

			if (!this.isCurrentSession(userId, generation)) return;

			runInAction(() => {
				this.applyActivityLog(activityLog);
				this.isHistoryReady = true;
			});
		});

		this.initializing = promise;

		void promise
			.finally(() => {
				if (this.initializing === promise) this.initializing = null;
			})
			.catch(() => {});

		return promise;
	}

	async deleteLogAuth(): Promise<void> {
		const userId = this.userStore.id;
		if (!userId || this.isLoading) return;

		const generation = this.generation;

		await this.withLoading(async () => {
			await this.repo.deleteActivityLog(userId);

			if (!this.isCurrentSession(userId, generation)) return;

			this.applyActivityLog([]);
		});
	}

	private async loadDeviceInfo(userId: string): Promise<void> {
		const generation = this.generation;
		const deviceInfo = await this.provider.getDeviceData();

		if (!this.isCurrentSession(userId, generation)) return;

		this.applyDeviceInfo(deviceInfo);
	}

	private async logAuthOnce(userId: string, authTime: number): Promise<void> {
		const deviceInfo = this.deviceInfo;
		const generation = this.generation;

		if (
			!deviceInfo ||
			!this.isCurrentSession(userId, generation) ||
			authTime <= this.lastProcessedAuthTime ||
			authTime === this.pendingAuthTime
		) {
			return;
		}

		this.pendingAuthTime = authTime;

		try {
			await this.repo.saveActivityLog(userId, {
				ip_address: deviceInfo.ip,
				city: deviceInfo.city,
				region: deviceInfo.region ?? '',
				browser: deviceInfo.browser,
				is_mobile: deviceInfo.isMobile,
			});

			if (!this.isCurrentSession(userId, generation)) return;

			runInAction(() => {
				this.lastProcessedAuthTime = authTime;
				this.isHistoryReady = false;
			});
		} finally {
			if (this.isCurrentSession(userId, generation)) this.pendingAuthTime = 0;
		}
	}

	private isCurrentSession(userId: string, generation: number): boolean {
		return this.userStore.id === userId && this.generation === generation;
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
			isHistoryReady: observable,

			isReady: computed,
			ip: computed,
			city: computed,
			region: computed,
			browser: computed,
			isMobile: computed,
			currentActivity: computed,

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
					this.reset();
					if (!userId) return;

					void this.loadDeviceInfo(userId).catch(() => {});
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
					] as const,
				([authTime, isAuthReady, hasDeviceInfo, userId]) => {
					if (
						authTime <= 0 ||
						authTime <= this.lastProcessedAuthTime ||
						!isAuthReady ||
						!hasDeviceInfo ||
						!userId
					) {
						return;
					}

					void this.logAuthOnce(userId, authTime).catch(() => {});
				},
				{ fireImmediately: true }
			)
		);
	}

	protected reset(): void {
		this.generation++;
		this.initializing = null;

		this.deviceInfo = null;
		this.activityLog = [];
		this.isHistoryReady = false;

		this.lastProcessedAuthTime = 0;
		this.pendingAuthTime = 0;

		this.setError(null);

		if (this.userStore.lastId) storage.remove(key(this.userStore.lastId, 'activity'));
	}
}
