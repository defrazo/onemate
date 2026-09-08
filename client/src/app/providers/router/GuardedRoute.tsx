import { Navigate, Outlet } from 'react-router-dom';
import { observer } from 'mobx-react-lite';

import { SplashScreen } from '@/shared/ui';

import { useStore } from '../store';

export const GuardedRoute = observer(() => {
	const { authStore, userStore } = useStore();

	if (authStore.isInitializing) return <SplashScreen />;

	if (!userStore.id) return <Navigate replace to="/" />;

	return <Outlet />;
});
