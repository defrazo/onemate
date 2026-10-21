import { api } from '@/shared/api';

import type { AppNotification, INotificationRepo } from '../../model';

export class NotificationRepoLaravel implements INotificationRepo {
	async getNotifications(): Promise<AppNotification[]> {
		const { data } = await api.get<AppNotification[]>('/notifications');
		return data;
	}

	async readNotification(id: string): Promise<AppNotification> {
		const { data } = await api.patch<AppNotification>(`/notifications/${id}/read`);
		return data;
	}

	async readAllNotifications(): Promise<void> {
		await api.patch('/notifications/read-all');
	}

	async deleteNotification(id: string): Promise<void> {
		await api.delete(`/notifications/${id}`);
	}

	async deleteAllNotifications(): Promise<void> {
		await api.delete('/notifications');
	}
}
