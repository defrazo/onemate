import { useState } from 'react';
import { observer } from 'mobx-react-lite';

import { IconEmail, IconEye, IconEyeSlash, IconPass, IconUser } from '@/shared/assets/icons';
import { Logo } from '@/shared/assets/images';
import { uiStore } from '@/shared/stores';
import { Button, Input } from '@/shared/ui';

import { validatePassword } from '../lib';
import { authFormStore } from '../model';
import { AuthSocial, PasswordHint } from '.';

interface AuthFormProps {
	onSubmit: () => void;
	returnBack?: () => void;
}

const AuthForm = ({ onSubmit }: AuthFormProps) => {
	const [showPassword, setShowPassword] = useState(false);
	const [showHint, setShowHint] = useState(false);
	const store = authFormStore;
	const isRegister = store.authType === 'register';
	const inputIconStyle = 'size-6 border-r border-[var(--border-color)] pr-1';

	const renderPasswordToggle = () => {
		if (!store.password) return null;

		const Icon = showPassword ? IconEyeSlash : IconEye;
		return (
			<Icon
				className="mr-1 size-6 cursor-pointer hover:text-[var(--accent-hover)]"
				onClick={() => setShowPassword((prev) => !prev)}
			/>
		);
	};

	return (
		<div className="flex flex-col items-center gap-4 p-4 md:w-lg">
			<div className="mb-4 flex flex-col items-center gap-2 select-none">
				<img alt="Логотип" className="size-20" src={Logo} />
				<h1 className="core-header">{isRegister ? 'Зарегистрировать аккаунт' : 'Войти в аккаунт'} OneMate</h1>
			</div>
			<AuthSocial />
			<div className="flex w-full items-center select-none">
				<div className="grow border-t border-[var(--border-color)]" />
				<span className="px-4">ИЛИ</span>
				<div className="grow border-t border-[var(--border-color)]" />
			</div>
			<form
				className="flex w-full flex-col gap-4"
				onSubmit={(e) => {
					e.preventDefault();
					onSubmit();
				}}
			>
				<Input
					id="username"
					leftIcon={<IconUser className={inputIconStyle} />}
					placeholder={isRegister ? 'Имя пользователя' : 'Имя пользователя или e-mail'}
					required
					type="text"
					value={store.username}
					variant="ghost"
					onChange={(event) => store.update('username', event.target.value)}
				/>

				{isRegister && (
					<Input
						id="email"
						leftIcon={<IconEmail className={inputIconStyle} />}
						placeholder="E-mail"
						required
						type="email"
						value={store.email}
						variant="ghost"
						onChange={(event) => store.update('email', event.target.value)}
					/>
				)}

				<div className="relative">
					<Input
						id="password"
						leftIcon={<IconPass className={inputIconStyle} />}
						placeholder="Пароль"
						required
						rightIcon={renderPasswordToggle()}
						type={showPassword ? 'text' : 'password'}
						value={store.password}
						variant="ghost"
						onBlur={() => setShowHint(false)}
						onChange={(event) => {
							const value = event.target.value;
							if (validatePassword(value)) store.update('password', value);
						}}
						onFocus={() => setShowHint(true)}
					/>

					{isRegister && <PasswordHint password={store.password} showHint={showHint} />}
				</div>
				{isRegister && (
					<Input
						id="passwordConfirm"
						leftIcon={<IconPass className={inputIconStyle} />}
						placeholder="Подтвердите пароль"
						required
						rightIcon={renderPasswordToggle()}
						type={showPassword ? 'text' : 'password'}
						value={store.passwordConfirm}
						variant="ghost"
						onChange={(event) => {
							const value = event.target.value;
							if (validatePassword(value)) store.update('passwordConfirm', value);
						}}
					/>
				)}

				{!isRegister && <a className="flex self-end text-sm">Забыли пароль?</a>}

				<Button
					className="mt-4 h-10 w-full"
					disabled={isRegister && store.password !== store.passwordConfirm}
					type="submit"
				>
					{isRegister ? 'Зарегистрироваться' : 'Войти'}
				</Button>
			</form>

			{!isRegister && (
				<p className="select-none">
					Нет аккаунта?{' '}
					<a
						className="text-[var(--accent-default)] hover:text-[var(--accent-hover)]"
						onClick={() => {
							store.update('authType', 'register');
							uiStore.setBack(() => {
								store.update('authType', 'login');
								uiStore.resetBack();
							});
						}}
					>
						Зарегистрироваться
					</a>
				</p>
			)}
		</div>
	);
};

export default observer(AuthForm);
