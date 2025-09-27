import { JSX } from 'react';
import { observer } from 'mobx-react-lite';

import type { AuthType } from '@/features/user-auth';
import { ConfirmForm, LoginForm, RegisterForm, ResetForm } from '@/features/user-auth';

import { useAuth } from '../model';

const AuthContainer = () => {
	const {
		authFormStore,
		isLoading,
		authType,
		handleOAuth,
		handleDemo,
		handleLogin,
		handleRegister,
		handleConfirm,
		handleReset,
	} = useAuth();

	const formMap: Record<AuthType, JSX.Element> = {
		login: (
			<LoginForm
				isLoading={isLoading}
				oAuth={handleOAuth}
				store={authFormStore}
				demoAuth={handleDemo}
				onSubmit={handleLogin}
			/>
		),
		register: (
			<RegisterForm isLoading={isLoading} oAuth={handleOAuth} store={authFormStore} onSubmit={handleRegister} />
		),
		confirm: <ConfirmForm isLoading={isLoading} store={authFormStore} onSubmit={handleConfirm} />,
		reset: <ResetForm isLoading={isLoading} store={authFormStore} onSubmit={handleReset} />,
	};

	return <>{formMap[authType]}</>;
};

export default observer(AuthContainer);
