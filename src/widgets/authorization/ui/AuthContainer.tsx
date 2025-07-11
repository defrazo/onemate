import { JSX } from 'react';
import { useNavigate } from 'react-router-dom';
import { observer } from 'mobx-react-lite';

import { userStore } from '@/entities/user';
import type { AuthType } from '@/features/user-auth';
import {
	authFormStore,
	authService,
	authStore,
	ConfirmForm,
	LoginForm,
	RegisterForm,
	ResetForm,
} from '@/features/user-auth';
import { notifyStore, uiStore } from '@/shared/stores';

const AuthContainer = () => {
	const navigate = useNavigate();
	const store = authFormStore;
	const handleSuccessAuth = () => {
		notifyStore.setSuccess(`Добро пожаловать, ${userStore.username}!`);
		uiStore.closeModal();
		navigate('/main');
	};

	const handleLogin = async () => {
		try {
			const success = await authStore.login();
			if (success) handleSuccessAuth();
		} catch (error: any) {
			notifyStore.setError(error.message || 'Произошла ошибка при входе');
		}
	};

	const handleRegister = async () => {
		try {
			const success = await authStore.register();
			if (success) {
				const loggedIn = await authStore.login();
				if (loggedIn) handleSuccessAuth();
			} else notifyStore.setSuccess('Письмо для подтверждения отправлено, проверьте почту.');
		} catch (error: any) {
			notifyStore.setError(error.message || 'Произошла ошибка при регистрации');
		}
	};

	const handleConfirm = async () => {
		try {
			!store.resetMode
				? await authService.handleResend(store.email)
				: await authService.resetPassword(store.email);
			notifyStore.setSuccess('Письмо отправлено, проверьте почту.');
		} catch (error: any) {
			notifyStore.setError(error.message || 'Произошла ошибка при отправке письма');
		}
	};

	const handleReset = async () => {
		try {
			await authService.updatePassword(store.password, store.passwordConfirm);
			store.setResetMode(false);
			uiStore.closeModal();
			navigate('/main');
		} catch (error: any) {
			notifyStore.setError(error.message || 'Произошла ошибка при отправке письма');
		}
	};

	const formMap: Record<AuthType, JSX.Element> = {
		login: <LoginForm onSubmit={handleLogin} />,
		register: <RegisterForm onSubmit={handleRegister} />,
		confirm: <ConfirmForm onSubmit={handleConfirm} />,
		reset: <ResetForm onSubmit={handleReset} />,
	};

	return formMap[store.authType] ?? null;
};

export default observer(AuthContainer);
