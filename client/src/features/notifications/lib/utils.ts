import type { AppNotification } from '../model';

export const showBrowserNotification = (notification: AppNotification) => {
	if (!('Notification' in window)) return;

	if (Notification.permission !== 'granted') return;

	new Notification(notification.title, { body: notification.message });
};
