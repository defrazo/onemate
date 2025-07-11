import { Navigate } from 'react-router-dom';
import { observer } from 'mobx-react-lite';

import { authStore } from '@/features/user-auth';

interface PrivateRouteProps {
	element: React.ReactNode;
}

const PrivateRoute = ({ element }: PrivateRouteProps) => {
	if (!authStore.isAuthChecked) {
		return <div>Загрузка...</div>;
	}

	return authStore.isAuthenticated ? element : <Navigate to="/404" />;
};

export default observer(PrivateRoute);
