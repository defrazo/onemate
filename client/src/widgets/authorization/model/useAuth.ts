import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useStore } from '@/app/providers';
import type { AuthType } from '@/features/user-auth';

const DEMO_LOGIN = 'demo@example.com';
const DEMO_PASSWORD = 'DemoPassword123';

export const useAuth = () => {
	const { authFormStore, authStore, modalStore, notifyStore, userStore } = useStore();
	const { login, username, email, password, passwordConfirm, authType } = authFormStore;
	const [isLoading, setIsLoading] = useState(false);

	const navigate = useNavigate();

	const handleAuthSuccess = () => {
		navigate('/dashboard');

		notifyStore.setNotice(`Добро пожаловать, ${userStore.username}!`, 'success');

		authFormStore.reset();
		modalStore.closeModal();
	};

	const handleError = (error: unknown, fallback = 'Произошла ошибка') => {
		const message = error instanceof Error ? error.message : fallback;

		notifyStore.setNotice(message || fallback, 'error');
	};

	const handleDemo = async (): Promise<void> => {
		if (isLoading) return;

		setIsLoading(true);

		try {
			const success = await authStore.login(DEMO_LOGIN, DEMO_PASSWORD);

			if (success) handleAuthSuccess();
		} catch (error) {
			handleError(error, 'Не удалось войти в демо-аккаунт');
		} finally {
			setIsLoading(false);
		}
	};

	const handleLogin = async (): Promise<void> => {
		if (isLoading) return;

		setIsLoading(true);

		try {
			const success = await authStore.login(login, password);
			if (success) handleAuthSuccess();
		} catch (error) {
			handleError(error, 'Произошла ошибка при входе');
		} finally {
			setIsLoading(false);
		}
	};

	const handleRegister = async () => {
		setIsLoading(true);

		try {
			const inviteToken = await authStore.verifyInvite(authFormStore.inviteCode);

			if (
				await authStore.register(
					username,
					email,
					password,
					passwordConfirm,
					inviteToken,
					authFormStore.privacyAccepted
				)
			) {
				authFormStore.switchToConfirm(email);
				notifyStore.setNotice('Письмо для подтверждения отправлено, проверьте почту', 'success');
			}
		} catch (error: any) {
			notifyStore.setNotice(error.message || 'Произошла ошибка при регистрации', 'error');
		} finally {
			setIsLoading(false);
		}
	};

	const handleOAuth = async (): Promise<void> => {
		notifyStore.setNotice('Авторизация через Google пока недоступна', 'info');
	};

	const handleConfirm = async () => {
		setIsLoading(true);

		try {
			if (authFormStore.resetMode) {
				if (await authStore.forgotPassword(email)) {
					authFormStore.startTimer();
					notifyStore.setNotice('Письмо для восстановления пароля отправлено', 'success');
				}

				return;
			}

			if (await authStore.resendConfirmation(email)) {
				authFormStore.startTimer();
				notifyStore.setNotice('Письмо для подтверждения отправлено', 'success');
			}
		} catch (error: any) {
			notifyStore.setNotice(error.message || 'Произошла ошибка при отправке письма', 'error');
		} finally {
			setIsLoading(false);
		}
	};
	return {
		authFormStore,
		isLoading,
		authType: authType as AuthType,
		handleOAuth,
		handleDemo,
		handleLogin,
		handleRegister,
		handleConfirm,
	};
};
