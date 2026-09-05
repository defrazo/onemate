import { IconUserFilled } from '@tabler/icons-react';
import axios from 'axios';
import { observer } from 'mobx-react-lite';

import { useStore } from '@/app/providers';
import { Button, Input } from '@/shared/ui';

import { emailCooldown, useAuth } from '../../model';
import { InputLabel, PasswordInput } from '../components';

export const LoginForm = observer(() => {
	const { authFormStore, authStore, notifyStore, userStore } = useStore();
	const { checkLogin, checkPassword } = useAuth();

	const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
		e.preventDefault();

		if (!checkLogin(authFormStore.login)) return;
		if (!checkPassword(authFormStore.password)) return;

		try {
			await authStore.login(authFormStore.login, authFormStore.password);

			notifyStore.setNotice(`Добро пожаловать, ${userStore.username}`, 'success');
		} catch (error: unknown) {
			if (
				axios.isAxiosError<{ code?: string; email?: string }>(error) &&
				error.response?.data?.code === 'EMAIL_NOT_VERIFIED'
			) {
				const email = error.response.data.email;

				if (email) {
					authFormStore.switchToConfirm(email);
					await authStore.resendConfirmation(email);
					emailCooldown.start();
				}

				return;
			}

			notifyStore.setNotice(error instanceof Error ? error.message : 'Не удалось выполнить вход', 'error');
		}
	};

	return (
		<form className="flex w-full flex-col gap-4" onSubmit={handleSubmit}>
			<Input
				id="login"
				leftIcon={<InputLabel htmlFor="login" icon={IconUserFilled} />}
				name="login"
				placeholder="Имя пользователя или e-mail"
				type="text"
				value={authFormStore.login}
				variant="ghost"
				onChange={(e) => authFormStore.setLogin(e.target.value)}
			/>
			<PasswordInput
				id="password"
				name="password"
				placeholder="Пароль"
				value={authFormStore.password}
				onChange={(e) => authFormStore.update('password', e.target.value)}
			/>
			<Button
				className="ml-auto text-sm hover:text-(--accent-hover)"
				size="custom"
				type="button"
				variant="mobile"
				onClick={() => authFormStore.switchToForgot()}
			>
				Забыли пароль?
			</Button>
			<Button className="core-elements mt-4 h-10 w-full" loading={authStore.isLoading} type="submit">
				Войти
			</Button>
		</form>
	);
});
