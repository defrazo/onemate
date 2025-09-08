import { makeAutoObservable, reaction, when } from 'mobx';

import type { ICityDeviceActivityPort } from '@/entities/city';
import type { IBaseUserPort } from '@/entities/user';
import type { IAuthDevicePort } from '@/features/user-auth';
import { storage } from '@/shared/lib/storage';
import { key } from '@/shared/lib/utils';
import type { Status } from '@/shared/stores';

import type { ActivityLog, DeviceData, IActivityRepo, IDeviceProvider } from '.';

export class DeviceActivityStore {
	private disposers = new Set<() => void>();
	private inited: boolean = false;
	private status: Status = 'idle';
	private error: string | null = null;

	private lastProcessedAuthTime: number = 0;

	activityLog: ActivityLog[] = [];
	deviceInfo: DeviceData | null = null;

	get isLoading(): boolean {
		return this.status === 'loading';
	}

	get isReady(): boolean {
		return this.status === 'ready' && this.deviceInfo !== null;
	}

	get isError(): boolean {
		return this.status === 'error';
	}

	get errorMessage(): string | null {
		return this.error;
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
		if (!this.userStore.id || this.isLoading) return;

		this.setLoading();

		try {
			await this.repo.deleteActivityLog(this.userStore.id);

			this.setActivityLog([]);
			this.setReady();
		} catch (error) {
			this.setError(error);
		}
	}

	private setDeviceInfo(info: DeviceData): void {
		this.deviceInfo = { ...(this.deviceInfo ?? {}), ...info };
	}

	private setActivityLog(logs: ActivityLog[]): void {
		this.activityLog = logs;
	}

	private async loadDeviceInfo(): Promise<void> {
		if (!this.isLoading) this.setLoading();

		try {
			this.setDeviceInfo(await this.provider.getDeviceData(this.cityStore.city));
			this.setReady();
		} catch (error) {
			this.setError(error);
		}
	}

	private async logAuthOnce(): Promise<void> {
		if (!this.userStore.id || this.deviceInfo === null || this.isLoading) return;

		this.setLoading();

		try {
			await this.repo.saveActivityLog(this.userStore.id, {
				ip_address: this.deviceInfo.ip,
				city: this.deviceInfo.city,
				region: this.deviceInfo.region ?? '',
				browser: this.deviceInfo.browser,
				is_mobile: this.deviceInfo.isMobile,
			});

			await this.loadDeviceLog();
		} catch (error) {
			this.setError(error);
		} finally {
			if (this.isLoading) this.setReady();
		}
	}

	private async loadDeviceLog(): Promise<void> {
		if (!this.userStore.id) return;

		this.setLoading();

		try {
			this.setActivityLog(await this.repo.loadActivityLog(this.userStore.id));
			this.setReady();
		} catch (error) {
			this.setError(error);
		}
	}

	private setLastProcessedAuthTime(ts: number): void {
		this.lastProcessedAuthTime = ts;
	}

	constructor(
		private readonly userStore: IBaseUserPort,
		private readonly authStore: IAuthDevicePort,
		private readonly cityStore: ICityDeviceActivityPort,
		private readonly repo: IActivityRepo,
		private readonly provider: IDeviceProvider
	) {
		makeAutoObservable<
			this,
			'userStore' | 'authStore' | 'cityStore' | 'repo' | 'provider' | 'inited' | 'disposers'
		>(this, {
			userStore: false,
			authStore: false,
			cityStore: false,
			repo: false,
			provider: false,
			inited: false,
			disposers: false,
		});
	}

	init(): void {
		if (this.inited) return;
		this.inited = true;

		this.track(
			reaction(
				() => this.userStore.id,
				(id) => !id && this.reset(),
				{ fireImmediately: true }
			)
		);

		this.track(
			reaction(
				() => [this.cityStore.isReady, this.cityStore.name] as const,
				async ([isReady]) => {
					if (isReady) {
						await this.loadDeviceInfo();
						void this.loadDeviceLog();
					}
				},
				{ fireImmediately: true }
			)
		);

		this.track(
			when(
				() =>
					this.authStore.lastAuthTime > 0 &&
					this.authStore.lastAuthTime > this.lastProcessedAuthTime &&
					this.authStore.isReady &&
					this.deviceInfo !== null &&
					!this.isLoading &&
					this.userStore.id !== null,
				async () => {
					try {
						await this.logAuthOnce();
						this.setLastProcessedAuthTime(this.authStore.lastAuthTime);
					} catch (error) {
						this.setError(error);
					}
				}
			)
		);
	}

	destroy(): void {
		this.disposers.forEach((dispose) => {
			try {
				dispose();
			} catch {}
		});
		this.disposers.clear();
		this.inited = false;
	}

	restart(): void {
		this.destroy();
		this.init();
	}

	private setLoading(): void {
		this.status = 'loading';
		this.error = null;
	}

	private setReady(): void {
		this.status = 'ready';
		this.error = null;
	}

	private setError(error: unknown): void {
		this.status = this.deviceInfo ? 'ready' : 'error';
		this.error = error instanceof Error ? error.message : String(error);
	}

	private reset(): void {
		this.status = 'idle';
		this.error = null;
		this.deviceInfo = null;
		this.activityLog = [];
		this.lastProcessedAuthTime = 0;

		if (this.userStore.lastId) storage.remove(key(this.userStore.lastId, 'activity'));
	}

	private track(disposer?: (() => void) | void): void {
		if (!disposer) return;
		this.disposers.add(disposer);
	}
}
