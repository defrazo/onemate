import axios from 'axios';
import { action, computed, makeObservable, observable, reaction, runInAction } from 'mobx';

import type { IBaseUserPort } from '@/entities/user';
import { storage } from '@/shared/lib/storage';
import { AsyncStore } from '@/shared/lib/store';

import { showBrowserNotification } from '../lib/utils';
import type { INotificationRepo } from './ports';
import type { AppNotification } from './types';

const BROWSER_NOTIFICATIONS_KEY = 'browser-notifications-enabled';
const REFRESH_INTERVAL = 15 * 60_000;
const STALE_AFTER = 60_000;
const MAX_BACKOFF = 60 * 60_000;

export class NotificationStore extends AsyncStore {
	private timer: ReturnType<typeof setTimeout> | null = null;
	private controller: AbortController | null = null;
	private request: Promise<AppNotification[]> | null = null;
	private generation = 0;
	private mutationRevision = 0;
	private lastLoadedAt: number | null = null;
	private retryAt = 0;
	private failures = 0;
	private pollingStopped = false;
	private seenIds = new Set<string>();

	notifications: AppNotification[] = [];
	isLoaded = false;

	browserNotificationsEnabled = true;

	get unreadCount(): number {
		return this.notifications.filter((notification) => notification.readAt === null).length;
	}

	get browserNotificationsSupported(): boolean {
		return 'Notification' in window;
	}

	async setBrowserNotificationsEnabled(enabled: boolean): Promise<void> {
		this.browserNotificationsEnabled = enabled;
		try {
			storage.set(BROWSER_NOTIFICATIONS_KEY, enabled);
		} catch {}

		if (enabled && this.browserNotificationsSupported && Notification.permission === 'default')
			await Notification.requestPermission();
	}

	showBrowserNotifications(notifications: AppNotification[]): void {
		if (!this.browserNotificationsEnabled) return;

		notifications.forEach((notification) => {
			try {
				showBrowserNotification(notification);
			} catch {}
		});
	}

	async load(): Promise<void> {
		await this.fetchNotifications();
	}

	refresh(): Promise<AppNotification[]> {
		return this.fetchNotifications();
	}

	async refreshIfStale(): Promise<void> {
		if (this.lastLoadedAt !== null && Date.now() - this.lastLoadedAt < STALE_AFTER) return;

		await this.load();
	}

	private fetchNotifications(): Promise<AppNotification[]> {
		const owner = this.userStore.id;
		if (!this.inited || !owner || this.pollingStopped) return Promise.resolve([]);
		if (this.request) return this.request;
		if (Date.now() < this.retryAt) return Promise.resolve([]);

		if (this.timer) clearTimeout(this.timer);
		this.timer = null;

		const generation = this.generation;
		const revision = this.mutationRevision;
		const controller = new AbortController();
		this.controller = controller;
		this.loading = true;
		this.setError(null);

		this.request = Promise.resolve()
			.then(() => (this.current(owner, generation) ? this.repo.getNotifications(controller.signal) : []))
			.then((notifications) => {
				if (!this.current(owner, generation) || revision !== this.mutationRevision) return [];

				const newNotifications = this.isLoaded
					? notifications.filter((notification) => !this.seenIds.has(notification.id))
					: [];

				runInAction(() => {
					this.notifications = notifications;
					this.isLoaded = true;
					this.lastLoadedAt = Date.now();
					this.retryAt = 0;
					this.failures = 0;

					for (const notification of notifications) this.seenIds.add(notification.id);
				});

				this.showBrowserNotifications(newNotifications);

				return newNotifications;
			})
			.catch((error: unknown) => {
				if (!this.current(owner, generation) || controller.signal.aborted) return [];

				runInAction(() => {
					this.setError(error instanceof Error ? error : new Error(String(error)));

					if (axios.isAxiosError(error) && [401, 403, 419].includes(error.response?.status ?? 0)) {
						this.pollingStopped = true;
						this.notifications = [];
						this.isLoaded = false;
					} else {
						this.failures = Math.min(this.failures + 1, 3);
						this.retryAt = Date.now() + Math.min(REFRESH_INTERVAL * 2 ** (this.failures - 1), MAX_BACKOFF);
					}
				});
				throw error;
			})
			.finally(() => {
				if (!this.current(owner, generation)) return;

				runInAction(() => {
					this.request = null;
					this.controller = null;
					this.loading = false;
				});

				if (!this.pollingStopped)
					this.timer = setTimeout(
						() => {
							this.timer = null;
							void this.load().catch(() => {});
						},
						this.failures > 0
							? Math.max(0, this.retryAt - Date.now())
							: revision !== this.mutationRevision
								? 0
								: REFRESH_INTERVAL
					);
			});

		return this.request;
	}

	private current(owner: string, generation: number): boolean {
		return this.inited && this.userStore.id === owner && this.generation === generation;
	}

	private async change<T>(operation: () => Promise<T>, apply: (result: T) => void): Promise<void> {
		const owner = this.userStore.id;
		const generation = this.generation;
		if (!owner || !this.current(owner, generation) || this.pollingStopped) return;

		try {
			const result = await operation();
			if (!this.current(owner, generation)) return;

			runInAction(() => {
				this.mutationRevision++;
				apply(result);
			});
		} catch (error) {
			if (this.current(owner, generation)) throw error;
		}
	}

	async markAsRead(id: string): Promise<void> {
		const notification = this.notifications.find((notification) => notification.id === id);
		if (!notification || notification.readAt !== null) return;

		await this.change(
			() => this.repo.readNotification(id),
			(updatedNotification) => {
				this.notifications = this.notifications.map((notification) =>
					notification.id === id ? updatedNotification : notification
				);
			}
		);
	}

	async markAllAsRead(): Promise<void> {
		if (this.unreadCount === 0) return;

		await this.change(
			() => this.repo.readAllNotifications(),
			() => {
				const readAt = new Date().toISOString();
				this.notifications = this.notifications.map((notification) =>
					notification.readAt === null ? { ...notification, readAt } : notification
				);
			}
		);
	}

	async remove(id: string): Promise<void> {
		await this.change(
			() => this.repo.deleteNotification(id),
			() => (this.notifications = this.notifications.filter((notification) => notification.id !== id))
		);
	}

	async removeAll(): Promise<void> {
		if (this.notifications.length === 0) return;

		await this.change(
			() => this.repo.deleteAllNotifications(),
			() => (this.notifications = [])
		);
	}

	constructor(
		private readonly userStore: IBaseUserPort,
		private readonly repo: INotificationRepo
	) {
		super();

		try {
			this.browserNotificationsEnabled = storage.get(BROWSER_NOTIFICATIONS_KEY) !== false;
		} catch {}

		makeObservable<this, 'fetchNotifications'>(this, {
			notifications: observable,
			isLoaded: observable,
			browserNotificationsEnabled: observable,

			unreadCount: computed,
			browserNotificationsSupported: computed,

			setBrowserNotificationsEnabled: action,
			fetchNotifications: action,
			reset: action,
		});
	}

	init(): void {
		if (this.inited) return;
		this.inited = true;

		this.track(
			reaction(
				() => this.userStore.id,
				(id) => {
					this.reset();

					if (id) void this.load().catch(() => {});
				},
				{ fireImmediately: true }
			)
		);
	}

	reset(): void {
		this.generation++;
		if (this.timer) clearTimeout(this.timer);
		this.timer = null;
		this.controller?.abort();
		this.controller = null;
		this.request = null;
		this.loading = false;
		this.setError(null);
		this.mutationRevision = 0;
		this.lastLoadedAt = null;
		this.retryAt = 0;
		this.failures = 0;
		this.pollingStopped = false;
		this.seenIds.clear();
		this.notifications = [];
		this.isLoaded = false;
	}

	destroy(): void {
		this.reset();
		super.destroy();
	}
}
