import { observer } from 'mobx-react-lite';
import { Navigate, Outlet } from 'react-router-dom';

import { SplashScreen } from '@/shared/ui';

import { useStore } from '../store';

export const PublicRoute = observer(() => {
	const { authStore, userStore } = useStore();

	if (authStore.isInitializing) return <SplashScreen />;

	if (userStore.id) return <Navigate replace to="/dashboard" />;

	return <Outlet />;
});
