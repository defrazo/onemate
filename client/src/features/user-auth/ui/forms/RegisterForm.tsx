import { useState } from 'react';
import { IconKeyFilled, IconMailFilled, IconUserFilled } from '@tabler/icons-react';
import { observer } from 'mobx-react-lite';

import { useStore } from '@/app/providers';
import { Button, Input } from '@/shared/ui';

import { emailCooldown, useAuth } from '../../model';
import { InputLabel, PasswordHint, PasswordInput } from '../components';

export const RegisterForm = observer(() => {
	const { authFormStore, authStore, notifyStore } = useStore();
	const { checkUsername, checkEmail, checkPassword, checkInvite } = useAuth();

	const [showHint, setShowHint] = useState(false);

	const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
		e.preventDefault();

		if (!checkUsername(authFormStore.username)) return;
		if (!checkEmail(authFormStore.email)) return;
		if (!checkPassword(authFormStore.password)) return;

		if (authFormStore.password !== authFormStore.passwordConfirm) {
			notifyStore.setNotice('Пароли не совпадают', 'info');
			return;
		}

		if (!checkInvite(authFormStore.inviteCode)) return;

		if (!authFormStore.isPrivacyAccepted) {
			notifyStore.setNotice('Требуется согласие на ПД', 'info');
			return;
		}

		try {
			const inviteToken = await authStore.verifyInvite(authFormStore.inviteCode);

			await authStore.register(
				authFormStore.username,
				authFormStore.email,
				authFormStore.password,
				authFormStore.passwordConfirm,
				inviteToken,
				authFormStore.isPrivacyAccepted
			);

			notifyStore.setNotice('Регистрация успешна. Проверьте почту', 'success');
			emailCooldown.start();
			authFormStore.switchToConfirm(authFormStore.email);
		} catch (error: unknown) {
			notifyStore.setNotice(error instanceof Error ? error.message : 'Проверьте введенные данные', 'error');
		}
	};

	return (
		<form className="flex w-full flex-col gap-4" onSubmit={handleSubmit}>
			<Input
				autoComplete="username"
				id="username"
				leftIcon={<InputLabel htmlFor="username" icon={IconUserFilled} />}
				name="username"
				placeholder="Имя пользователя"
				type="text"
				value={authFormStore.username}
				variant="ghost"
				onChange={(e) => authFormStore.update('username', e.target.value)}
			/>
			<Input
				autoComplete="email"
				id="email"
				leftIcon={<InputLabel htmlFor="email" icon={IconMailFilled} />}
				name="email"
				placeholder="E-mail"
				type="email"
				value={authFormStore.email}
				variant="ghost"
				onChange={(e) => authFormStore.update('email', e.target.value)}
			/>
			<div className="relative">
				<PasswordInput
					autoComplete="new-password"
					id="password"
					name="password"
					placeholder="Пароль"
					value={authFormStore.password}
					onBlur={() => setShowHint(false)}
					onChange={(e) => authFormStore.update('password', e.target.value)}
					onFocus={() => setShowHint(true)}
				/>
				<PasswordHint password={authFormStore.password} showHint={showHint} />
			</div>
			<PasswordInput
				autoComplete="new-password"
				name="password-confirm"
				placeholder="Подтвердите пароль"
				value={authFormStore.passwordConfirm}
				onChange={(e) => authFormStore.update('passwordConfirm', e.target.value)}
				onPaste={(e) => {
					e.preventDefault();
					notifyStore.setNotice('Подтвердите пароль, введя его вручную', 'error');
				}}
			/>
			<Input
				autoComplete="off"
				id="invite-code"
				leftIcon={<InputLabel htmlFor="invite-code" icon={IconKeyFilled} />}
				name="invite-code"
				placeholder="Код приглашения"
				type="text"
				value={authFormStore.inviteCode}
				variant="ghost"
				onChange={(e) => authFormStore.update('inviteCode', e.target.value)}
			/>
			<Button className="core-elements mt-4 h-10 w-full" loading={authStore.isLoading} type="submit">
				Зарегистрироваться
			</Button>
		</form>
	);
});
