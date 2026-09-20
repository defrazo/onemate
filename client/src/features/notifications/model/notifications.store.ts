import { action, computed, makeObservable, observable, reaction, runInAction } from 'mobx';

import { IBaseUserPort } from '@/entities/user';
import { storage } from '@/shared/lib/storage';
import { AsyncStore } from '@/shared/lib/store';

import {
	deleteAllNotifications,
	deleteNotification,
	getNotifications,
	readAllNotifications,
	readNotification,
} from '../api';
import { showBrowserNotification } from '../lib';
import type { AppNotification } from '.';

const BROWSER_NOTIFICATIONS_KEY = 'browser-notifications-enabled';

export class NotificationStore extends AsyncStore {
	notifications: AppNotification[] = [];
	isLoaded = false;

	browserNotificationsEnabled =
		'Notification' in window &&
		Notification.permission === 'granted' &&
		storage.get(BROWSER_NOTIFICATIONS_KEY) === 'true';

	get unreadCount(): number {
		return this.notifications.filter((notification) => notification.readAt === null).length;
	}

	get browserNotificationsSupported(): boolean {
		return 'Notification' in window;
	}

	async setBrowserNotificationsEnabled(enabled: boolean): Promise<void> {
		if (!enabled) {
			this.browserNotificationsEnabled = false;
			storage.set(BROWSER_NOTIFICATIONS_KEY, 'false');
			return;
		}

		if (!this.browserNotificationsSupported) return;

		const permission = await Notification.requestPermission();

		runInAction(() => (this.browserNotificationsEnabled = permission === 'granted'));

		storage.set(BROWSER_NOTIFICATIONS_KEY, String(permission === 'granted'));
	}

	showBrowserNotifications(notifications: AppNotification[]): void {
		if (!this.browserNotificationsEnabled) return;

		notifications.forEach(showBrowserNotification);
	}

	async load(): Promise<void> {
		if (this.isLoading) return;

		await this.withLoading(async () => {
			const notifications = await getNotifications();

			runInAction(() => {
				this.notifications = notifications;
				this.isLoaded = true;
			});
		});
	}

	async refresh(): Promise<AppNotification[]> {
		const notifications = await getNotifications();

		const currentIds = new Set(this.notifications.map((notification) => notification.id));

		const newNotifications = notifications.filter((notification) => !currentIds.has(notification.id));

		runInAction(() => (this.notifications = notifications));

		return newNotifications;
	}

	async markAsRead(id: string): Promise<void> {
		const notification = this.notifications.find((notification) => notification.id === id);
		if (!notification || notification.readAt !== null) return;

		const updatedNotification = await readNotification(id);

		runInAction(() => {
			this.notifications = this.notifications.map((notification) =>
				notification.id === id ? updatedNotification : notification
			);
		});
	}

	async markAllAsRead(): Promise<void> {
		if (this.unreadCount === 0) return;

		await readAllNotifications();

		const readAt = new Date().toISOString();

		runInAction(() => {
			this.notifications = this.notifications.map((notification) =>
				notification.readAt === null ? { ...notification, readAt } : notification
			);
		});
	}

	async remove(id: string): Promise<void> {
		await deleteNotification(id);

		runInAction(() => (this.notifications = this.notifications.filter((notification) => notification.id !== id)));
	}

	async removeAll(): Promise<void> {
		if (this.notifications.length === 0) return;

		await deleteAllNotifications();

		runInAction(() => (this.notifications = []));
	}

	constructor(private readonly userStore: IBaseUserPort) {
		super();

		makeObservable<this, 'reset'>(this, {
			notifications: observable,
			isLoaded: observable,
			browserNotificationsEnabled: observable,

			unreadCount: computed,
			browserNotificationsSupported: computed,

			setBrowserNotificationsEnabled: action,
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
					if (!id) {
						this.reset();
						return;
					}

					void this.load();
				},
				{ fireImmediately: true }
			)
		);
	}

	reset(): void {
		this.notifications = [];
		this.isLoaded = false;
	}
}
