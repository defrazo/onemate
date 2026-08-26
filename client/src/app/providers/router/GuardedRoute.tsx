import type { ReactElement } from 'react';
import { Navigate } from 'react-router-dom';
import { observer } from 'mobx-react-lite';

import { PreloaderExt } from '@/shared/ui';

import { useStore } from '../store';

interface GuardedRouteProps {
	element: ReactElement;
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
		const { authStore, userStore } = useStore();

		if (requireAuth && authStore.isLoading) return <PreloaderExt />;

		if (requireAuth && !userStore.id) return <Navigate replace to={fallbackPath} />;

		if (userStore.id && redirectIfDeleted && userStore.isDeleted)
			return <Navigate replace to={deletedRedirectPath} />;

		if (redirectIfNotDeleted && (!userStore.id || !userStore.isDeleted))
			return <Navigate replace to={fallbackPath} />;

		return element;
	}
);
