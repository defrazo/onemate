import { observer } from 'mobx-react-lite';
import { Navigate, Outlet } from 'react-router-dom';

import { type Feature, PermissionService } from '@/entities/user';
import { SplashScreen } from '@/shared/ui';

import { useStore } from '../store';

export const GuardedRoute = observer(({ feature }: { feature?: Feature }) => {
	const { authStore, userStore } = useStore();

	if (authStore.isInitializing) return <SplashScreen />;

	if (!userStore.id) return <Navigate replace to="/" />;

	if (feature && !PermissionService.canPerform(userStore.userRole, feature, 'read'))
		return <Navigate replace to="/dashboard" />;

	return <Outlet />;
});
