import { type PropsWithChildren, useEffect } from 'react';
import { observer } from 'mobx-react-lite';

import { useStore } from '../store';

const NOTIFICATIONS_REFRESH_INTERVAL = 60_000;

export const NotificationsProvider = observer(({ children }: PropsWithChildren) => {
	const { notificationStore, userStore } = useStore();

	useEffect(() => {
		if (!userStore.id) {
			notificationStore.reset();
			return;
		}

		let intervalId: number | undefined;
		let cancelled = false;

		const start = async () => {
			try {
				await notificationStore.load();
			} catch {
				return;
			}

			if (cancelled) return;

			intervalId = window.setInterval(() => {
				void (async () => {
					try {
						const newNotifications = await notificationStore.refresh();
						notificationStore.showBrowserNotifications(newNotifications);
					} catch {
						// Следующая попытка будет через интервал.
					}
				})();
			}, NOTIFICATIONS_REFRESH_INTERVAL);
		};

		void start();

		return () => {
			cancelled = true;

			if (intervalId !== undefined) window.clearInterval(intervalId);
		};
	}, [notificationStore, userStore.id]);

	return children;
});
