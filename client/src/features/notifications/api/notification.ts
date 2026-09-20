import { api } from '@/shared/api';

import type { AppNotification } from '../model';

export const getNotifications = async (): Promise<AppNotification[]> => {
	const { data } = await api.get<AppNotification[]>('/notifications');
	return data;
};

export const readNotification = async (id: string): Promise<AppNotification> => {
	const { data } = await api.patch<AppNotification>(`/notifications/${id}/read`);
	return data;
};

export const readAllNotifications = async (): Promise<void> => {
	await api.patch('/notifications/read-all');
};

export const deleteNotification = async (id: string): Promise<void> => {
	await api.delete(`/notifications/${id}`);
};

export const deleteAllNotifications = async (): Promise<void> => {
	await api.delete('/notifications');
};
