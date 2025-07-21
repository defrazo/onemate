import { Navigate } from 'react-router-dom';
import { observer } from 'mobx-react-lite';

import { userStore } from '@/entities/user';
import { authStore } from '@/features/user-auth';
import { LoadFallback } from '@/shared/ui';

interface GuardedRouteProps {
	element: React.ReactElement;
	requireAuth?: boolean; // Для авторизованных
	redirectIfDeleted?: boolean; // Для неудаленных
	fallbackPath?: string; // Куда редиректить неавторизованных
	deletedRedirectPath?: string; // Куда редиректить удаленных
}

export const GuardedRoute = observer(
	({
		element,
		requireAuth = true,
		redirectIfDeleted = true,
		fallbackPath = '/',
		deletedRedirectPath = '/account/deleted',
	}: GuardedRouteProps) => {
		if (!authStore.isAuthChecked) return <LoadFallback />;

		if (redirectIfDeleted && userStore.isDeleted) return <Navigate replace to={deletedRedirectPath} />;

		if (requireAuth && !userStore.isAuthenticated) return <Navigate replace to={fallbackPath} />;

		return element;
	}
);
