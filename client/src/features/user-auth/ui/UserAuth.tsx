import { useEffect } from 'react';
import { observer } from 'mobx-react-lite';

import { useStore } from '@/app/providers';

import { ConfirmScreen, ForgotScreen, LoginScreen, RegisterScreen } from './screens';

export const UserAuth = observer(() => {
	const { authFormStore, modalStore, userStore } = useStore();

	useEffect(() => {
		if (userStore.id) modalStore.closeModal();
	}, [userStore.id]);

	switch (authFormStore.authType) {
		case 'register':
			return <RegisterScreen />;
		case 'confirm':
			return <ConfirmScreen />;
		case 'forgot':
			return <ForgotScreen />;
		default:
			return <LoginScreen />;
	}
});
