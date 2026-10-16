import type { AppNotification } from '.';

export interface INotificationRepo {
	getNotifications(): Promise<AppNotification[]>;
	readNotification(id: string): Promise<AppNotification>;
	readAllNotifications(): Promise<void>;
	deleteNotification(id: string): Promise<void>;
	deleteAllNotifications(): Promise<void>;
}
