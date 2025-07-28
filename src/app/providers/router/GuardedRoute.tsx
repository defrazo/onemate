import { Navigate } from 'react-router-dom';
import { observer } from 'mobx-react-lite';

import { userStore } from '@/entities/user';
import { authStore } from '@/features/user-auth';
import { LoadFallback } from '@/shared/ui';

interface GuardedRouteProps {
	element: React.ReactElement;
	requireAuth?: boolean; // Требуется авторизация
	redirectIfDeleted?: boolean; // Редирект если удален
	redirectIfNotDeleted?: boolean; // Редирект если не удален
	fallbackPath?: string; // Редирект по-умолчанию
	deletedRedirectPath?: string; // Редирект для удаленных
}

export const GuardedRoute = observer(
	({
		element,
		requireAuth = true,
		redirectIfDeleted = true,
		redirectIfNotDeleted = false,
		fallbackPath = '/',
		deletedRedirectPath = '/account/deleted',
	}: GuardedRouteProps) => {
		if (!authStore.isAuthChecked) return <LoadFallback />;

		if (redirectIfDeleted && userStore.isDeleted) return <Navigate replace to={deletedRedirectPath} />;

		if (redirectIfNotDeleted && !userStore.isDeleted) return <Navigate replace to={fallbackPath} />;

		if (requireAuth && !userStore.isAuthenticated) return <Navigate replace to={fallbackPath} />;

		return element;
	}
);
