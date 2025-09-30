import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useStore } from '@/app/providers';
import type { AuthType } from '@/features/user-auth';

export const useAuth = () => {
	const { accountStore, authFormStore, authStore, modalStore, notifyStore, userStore } = useStore();
	const { login, username, email, password, passwordConfirm, authType } = authFormStore;
	const [isLoading, setIsLoading] = useState<boolean>(false);

	const navigate = useNavigate();

	const handleExisting = async (email: string, authType: AuthType): Promise<boolean> => {
		const existing = await userStore.checkUserByEmail(email);

		switch (authType) {
			case 'login':
				if (!existing) {
					notifyStore.setNotice('Пользователь не найден', 'info');
					return false;
				}
				if (!existing.email_confirmed_at) {
					authFormStore.switchToConfirm(email);

					await authStore.resendConfirmation(email);

					notifyStore.setNotice('Подтвердите e-mail, прежде чем войти', 'info');
					return false;
				}
				return true;
			case 'register':
				if (existing) {
					if (!existing.email_confirmed_at) {
						authFormStore.switchToConfirm(email);

						await authStore.resendConfirmation(email);

						notifyStore.setNotice('Аккаунт уже зарегистрирован, подтвердите e-mail', 'info');
						return false;
					} else {
						notifyStore.setNotice('Пользователь с таким e-mail уже существует', 'info');
						return false;
					}
				}
				return true;
			case 'confirm':
				if (!existing) {
					notifyStore.setNotice('Пользователь не найден', 'info');
					return false;
				}
				if (existing.email_confirmed_at) {
					notifyStore.setNotice('Этот аккаунт уже подтвержден', 'info');
					return false;
				}
				return true;
			case 'reset':
				return true;
			default:
				return false;
		}
	};

	const handleOAuth = async () => {
		setIsLoading(true);
		await new Promise(requestAnimationFrame);
		try {
			await authStore.startOAuth('google');
		} catch (error: any) {
			notifyStore.setNotice(error.message || 'Произошла ошибка при входе', 'error');
		}
	};

	const handleDemo = async () => {
		const login = 'demo@example.com';
		const password = '12345678';

		setIsLoading(true);
		try {
			if (!(await handleExisting(login, authType))) return;

			if (await authStore.login(login, password)) {
				navigate('/dashboard');

				notifyStore.setNotice(`Добро пожаловать, ${userStore.username}!`, 'success');
				authFormStore.reset();
				modalStore.closeModal();
			}
		} catch (error: any) {
			notifyStore.setNotice(error.message || 'Произошла ошибка при входе', 'error');
		} finally {
			setIsLoading(false);
		}
	};

	const handleLogin = async () => {
		setIsLoading(true);
		try {
			if (!(await handleExisting(login, authType))) return;

			if (await authStore.login(login, password)) {
				navigate('/dashboard');

				notifyStore.setNotice(`Добро пожаловать, ${userStore.username}!`, 'success');
				authFormStore.reset();
				modalStore.closeModal();
			}
		} catch (error: any) {
			notifyStore.setNotice(error.message || 'Произошла ошибка при входе', 'error');
		} finally {
			setIsLoading(false);
		}
	};

	const handleRegister = async () => {
		setIsLoading(true);
		try {
			if (!(await handleExisting(email, authType))) return;

			if (await authStore.register(username, email, password, passwordConfirm)) {
				authFormStore.switchToConfirm(email);
				notifyStore.setNotice('Письмо для подтверждения отправлено, проверьте почту', 'success');
			}
		} catch (error: any) {
			notifyStore.setNotice(error.message || 'Произошла ошибка при регистрации', 'error');
		} finally {
			setIsLoading(false);
		}
	};

	const handleConfirm = async () => {
		setIsLoading(true);
		try {
			if (authFormStore.resetMode) {
				if (await authStore.resetPassword(email)) {
					authFormStore.startTimer();
					notifyStore.setNotice('Письмо для сброса пароля отправлено', 'success');
				} else notifyStore.setNotice('Что-то пошло не так', 'info');

				return;
			} else {
				if (!(await handleExisting(email, 'confirm'))) return;

				if (await authStore.resendConfirmation(email)) {
					authFormStore.startTimer();
					notifyStore.setNotice('Письмо для подтверждения отправлено', 'success');
				} else notifyStore.setNotice('Что-то пошло не так', 'info');
			}
		} catch (error: any) {
			notifyStore.setNotice(error.message || 'Произошла ошибка при отправке письма', 'error');
		} finally {
			setIsLoading(false);
		}
	};

	const handleReset = async () => {
		setIsLoading(true);
		try {
			await accountStore.updatePassword(password, passwordConfirm);

			authFormStore.setResetMode(false);
			modalStore.closeModal();
			navigate('/dashboard');
		} catch (error: any) {
			notifyStore.setNotice(error.message || 'Произошла ошибка при отправке письма', 'error');
		} finally {
			setIsLoading(false);
		}
	};

	return {
		authFormStore,
		isLoading,
		authType,
		handleOAuth,
		handleDemo,
		handleLogin,
		handleRegister,
		handleConfirm,
		handleReset,
	};
};
