import { Navigate } from 'react-router-dom';
import { observer } from 'mobx-react-lite';

import { authStore } from '@/features/user-auth';
import { Preloader } from '@/shared/ui';

interface PrivateRouteProps {
	element: React.ReactNode;
}

const PrivateRoute = ({ element }: PrivateRouteProps) => {
	if (!authStore.isAuthChecked) {
		return (
			<div className="flex h-screen items-center justify-center">
				<Preloader className="size-50" />
			</div>
		);
	}

	return authStore.isAuthenticated ? element : <Navigate to="/404" />;
};

export default observer(PrivateRoute);
