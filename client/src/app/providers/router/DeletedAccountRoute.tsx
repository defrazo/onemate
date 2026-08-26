import { Navigate, Outlet } from 'react-router-dom';
import { observer } from 'mobx-react-lite';

import { useStore } from '../store';

export const DeletedAccountRoute = observer(() => {
	const { userStore } = useStore();

	if (!userStore.isDeleted) return <Navigate replace to="/dashboard" />;

	return <Outlet />;
});
