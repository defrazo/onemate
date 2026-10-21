import { IconUserFilled } from '@tabler/icons-react';
import axios from 'axios';
import { observer } from 'mobx-react-lite';

import { useStore } from '@/app/providers';
import { useValidation } from '@/shared/lib/hooks';
import { Button, Input, InputLabel, PasswordInput } from '@/shared/ui';

import { emailCooldown } from '../../model';

export const LoginForm = observer(() => {
	const { checkLogin, checkPassword } = useValidation();

	const { authFormStore, authStore, notifyStore, userStore } = useStore();

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
		<form className="flex w-full flex-col gap-3" onSubmit={handleSubmit}>
			<Input
				className="border-(--border-tone)"
				id="login"
				leftIcon={<InputLabel className="border-(--border-tone)" htmlFor="login" icon={IconUserFilled} />}
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
				variant="ghost"
				onChange={(e) => authFormStore.update('password', e.target.value)}
			/>
			<Button
				className="ml-auto text-sm hover:text-(--accent-primary-hover) lg:-mt-2"
				padding="none"
				type="button"
				variant="custom"
				onClick={() => authFormStore.switchToForgot()}
			>
				Забыли пароль?
			</Button>
			<Button
				className="mt-4 h-8 w-full"
				loading={authStore.isLoading}
				loadingText="Выполняется вход..."
				type="submit"
				variant="accent"
			>
				Войти
			</Button>
		</form>
	);
});
