import { Navigate, Outlet } from 'react-router-dom';
import { observer } from 'mobx-react-lite';

import { PreloaderExt } from '@/shared/ui';

import { useStore } from '../store';

export const PublicRoute = observer(() => {
	const { authStore, userStore } = useStore();

	if (authStore.isLoading) return <PreloaderExt />;

	if (userStore.id) return <Navigate replace to="/dashboard" />;

	return <Outlet />;
});
