import { type FormEvent, useState } from 'react';
import { observer } from 'mobx-react-lite';

import { useStore } from '@/app/providers';
import { IconEmail, IconPass, IconUser } from '@/shared/assets/icons';
import { Logo } from '@/shared/assets/images';
import { validateEmail, validatePasswords, validateUsername } from '@/shared/lib/validators';
import { Button, Input } from '@/shared/ui';

import { renderPasswordToggle } from '../lib';
import { AuthFormStore } from '../model';
import { AuthSocial, PasswordHint } from '.';

interface RegisterFormProps {
	store: AuthFormStore;
	isLoading: boolean;
	onSubmit: () => void;
}

export const RegisterForm = observer(({ store, isLoading, onSubmit }: RegisterFormProps) => {
	const { notifyStore } = useStore();
	const [showPassword, setShowPassword] = useState<boolean>(false);
	const [showHint, setShowHint] = useState<boolean>(false);
	const [isPasswordValid, setIsPasswordValid] = useState<boolean>(false);

	const passwordToggleIcon = renderPasswordToggle({
		show: showPassword,
		toggle: () => setShowPassword((p) => !p),
		visible: !!store.password,
	});

	const handleSubmit = async (e: FormEvent) => {
		e.preventDefault();

		try {
			await validateUsername(store.username);
			await validateEmail(store.email);
			await validatePasswords(store.password, store.passwordConfirm);

			if (!store.inviteCode.trim()) throw new Error('Введите код приглашения');

			if (!store.privacyAccepted) throw new Error('Необходимо принять политику конфиденциальности');

			onSubmit();
		} catch (error: any) {
			notifyStore.setNotice(error.message || 'Проверьте введенные данные', 'error');
		}
	};

	return (
		<div className="flex flex-col items-center gap-4 px-2 pb-4 md:w-lg md:p-0">
			<div className="flex flex-col items-center gap-2 select-none">
				<img alt="Логотип" className="size-20" decoding="async" loading="lazy" src={Logo} />
				<h1 className="core-header">Зарегистрировать аккаунт OneMate</h1>
			</div>
			<AuthSocial isLoading={isLoading} />
			<div className="flex w-full items-center select-none">
				<div className="grow border-t border-(--border-color)" />
				<span className="px-4">ИЛИ</span>
				<div className="grow border-t border-(--border-color)" />
			</div>
			<form className="flex w-full flex-col gap-4" onSubmit={handleSubmit}>
				<Input
					autoComplete="username"
					leftIcon={<IconUser className="size-6 border-r border-(--border-color) pr-1" />}
					name="username"
					placeholder="Имя пользователя"
					required
					type="text"
					value={store.username}
					variant="ghost"
					onBlur={(e) => store.update('username', e.target.value.trim())}
					onChange={(e) => store.update('username', e.target.value)}
				/>
				<Input
					autoComplete="email"
					leftIcon={<IconEmail className="size-6 border-r border-(--border-color) pr-1" />}
					name="email"
					placeholder="E-mail"
					required
					type="email"
					value={store.email}
					variant="ghost"
					onBlur={(e) => store.update('email', e.target.value.trim())}
					onChange={(e) => store.update('email', e.target.value)}
				/>
				<div className="relative">
					<Input
						leftIcon={<IconPass className="size-6 border-r border-(--border-color) pr-1" />}
						name="password"
						placeholder="Пароль"
						required
						rightIcon={passwordToggleIcon}
						type={showPassword ? 'text' : 'password'}
						value={store.password}
						variant="ghost"
						onBlur={(e) => {
							setShowHint(false);
							store.update('password', e.target.value.trim());
						}}
						onChange={(e) => store.update('password', e.target.value)}
						onFocus={() => setShowHint(true)}
					/>
					<PasswordHint
						password={store.password}
						showHint={showHint}
						onValidityChange={(value) => setIsPasswordValid(value)}
					/>
				</div>
				<Input
					leftIcon={<IconPass className="size-6 border-r border-(--border-color) pr-1" />}
					name="password-confirm"
					placeholder="Подтвердите пароль"
					required
					rightIcon={passwordToggleIcon}
					type={showPassword ? 'text' : 'password'}
					value={store.passwordConfirm}
					variant="ghost"
					onBlur={(e) => store.update('passwordConfirm', e.target.value.trim())}
					onChange={(e) => store.update('passwordConfirm', e.target.value)}
					onPaste={(e) => {
						e.preventDefault();
						notifyStore.setNotice('Подтвердите пароль, введя его вручную', 'error');
					}}
				/>
				<Input
					autoComplete="off"
					name="invite-code"
					placeholder="Код приглашения"
					required
					type="text"
					value={store.inviteCode}
					variant="ghost"
					onBlur={(e) => store.update('inviteCode', e.target.value.trim())}
					onChange={(e) => store.update('inviteCode', e.target.value)}
				/>
				<Button
					className="core-elements mt-4 h-10 w-full"
					disabled={!isPasswordValid || !store.privacyAccepted}
					loading={isLoading}
					type="submit"
				>
					Зарегистрироваться
				</Button>
				<label className="flex cursor-pointer items-start gap-2 text-sm">
					<input
						checked={store.privacyAccepted}
						className="mt-1"
						type="checkbox"
						onChange={(e) => store.update('privacyAccepted', e.target.checked)}
					/>
					<span>Я принимаю политику конфиденциальности</span>
				</label>
			</form>
		</div>
	);
});
