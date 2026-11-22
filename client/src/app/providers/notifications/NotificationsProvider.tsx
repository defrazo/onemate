import { type PropsWithChildren, useEffect } from 'react';
import { observer } from 'mobx-react-lite';

import { useStore } from '../store';

export const NotificationsProvider = observer(({ children }: PropsWithChildren) => {
	const { notificationStore } = useStore();

	useEffect(() => {
		const onVisibilityChange = () => {
			if (document.visibilityState === 'visible') void notificationStore.refreshIfStale().catch(() => {});
		};

		document.addEventListener('visibilitychange', onVisibilityChange);

		return () => document.removeEventListener('visibilitychange', onVisibilityChange);
	}, [notificationStore]);

	return children;
});
