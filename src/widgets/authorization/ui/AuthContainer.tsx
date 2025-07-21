import { JSX, useState } from 'react';
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
import { Preloader } from '@/shared/ui';

const AuthContainer = () => {
	const [isLoading, setIsLoading] = useState(false);

	const navigate = useNavigate();
	const store = authFormStore;
	const handleSuccessAuth = () => {
		notifyStore.setSuccess(`Добро пожаловать, ${userStore.username}!`);
		uiStore.closeModal();
		navigate('/dashboard');
	};

	const handleLogin = async () => {
		setIsLoading(true);

		try {
			const success = await authStore.login();
			if (success) handleSuccessAuth();
		} catch (error: any) {
			notifyStore.setError(error.message || 'Произошла ошибка при входе');
		} finally {
			setIsLoading(false);
		}
	};

	const handleRegister = async () => {
		try {
			const success = await authStore.register();
			if (success) {
				const loggedIn = await authStore.login();
				if (loggedIn) handleSuccessAuth();
			} else notifyStore.setSuccess('Письмо для подтверждения отправлено, проверьте почту');
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
			navigate('/dashboard');
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

	return (
		<>
			{formMap[store.authType]}

			{isLoading && (
				<div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[var(--bg-primary)]">
					<span className="mb-4 animate-pulse text-xl font-medium">Подождите, выполняется вход...</span>
					<Preloader className="size-15" />
				</div>
			)}
		</>
	);
};

export default observer(AuthContainer);
