import { useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';

import { IconEmail, IconEye, IconEyeSlash, IconPass, IconUser } from '@/shared/assets/icons';
import { Logo } from '@/shared/assets/images';
import { useIsMobile } from '@/shared/lib/hooks';
import { appStore } from '@/shared/store/appStore';
import { Button, Input } from '@/shared/ui';

import { validatePassword } from '../lib';
import { authFormStore } from '../model';
import { AuthPassHint, AuthSocial } from '.';

interface AuthFormProps {
	onSubmit: () => void;
	error?: string;
	returnBack?: () => void;
}

const AuthForm = ({ onSubmit, error }: AuthFormProps) => {
	const [showPassword, setShowPassword] = useState(false);
	const [showHint, setShowHint] = useState(false);
	const isMobile = useIsMobile();
	const auth = authFormStore.authForm;
	const isRegister = auth.authType === 'register';

	const renderPasswordToggle = () => {
		if (!auth.password) return null;

		return showPassword ? (
			<IconEyeSlash
				className="cursor-pointer p-1 hover:text-[var(--accent-default)]"
				onClick={() => setShowPassword((prev) => !prev)}
			/>
		) : (
			<IconEye
				className="cursor-pointer p-1 hover:text-[var(--accent-default)]"
				onClick={() => setShowPassword((prev) => !prev)}
			/>
		);
	};

	useEffect(() => {
		if (error) appStore.setError(error);
	}, [error]);

	return (
		<div className="flex flex-col items-center gap-4 p-4 md:w-lg">
			<div className="flex flex-col items-center select-none">
				<img alt="Логотип" className="w-20" src={Logo} />
				<span className="core-headers">
					{isRegister ? 'Зарегистрировать аккаунт' : 'Войти в аккаунт'} OneMate
				</span>
			</div>
			<AuthSocial />
			<div className="flex w-full items-center select-none">
				<div className="grow border-t-2"></div>
				<span className="px-4">ИЛИ</span>
				<div className="grow border-t-2"></div>
			</div>
			<form
				className="flex w-full flex-col"
				onSubmit={(e) => {
					e.preventDefault();
					onSubmit();
				}}
			>
				<div className="relative">
					<Input
						className="core-auth-input rounded-b-none"
						id="username"
						leftIcon={<IconUser />}
						placeholder={isRegister ? 'Имя пользователя' : 'Имя пользователя или e-mail'}
						required
						type="text"
						value={auth.username}
						variant={isMobile ? 'ghost' : 'default'}
						onChange={(event) => authFormStore.update('username', event.target.value)}
					/>
				</div>

				{isRegister && (
					<div className="relative">
						<Input
							className="core-auth-input rounded-none"
							id="email"
							leftIcon={<IconEmail />}
							placeholder="E-mail"
							required
							type="email"
							value={auth.email}
							variant={isMobile ? 'ghost' : 'default'}
							onChange={(event) => authFormStore.update('email', event.target.value)}
						/>
					</div>
				)}

				<div className="relative">
					<Input
						className={`rounded-t-none ${isRegister ? 'rounded-b-none' : ''}`}
						id="password"
						leftIcon={<IconPass />}
						placeholder="Пароль"
						required
						rightIcon={renderPasswordToggle()}
						type={showPassword ? 'text' : 'password'}
						value={auth.password}
						variant={isMobile ? 'ghost' : 'default'}
						onBlur={() => setShowHint(false)}
						onChange={(event) => {
							const value = event.target.value;
							if (validatePassword(value)) authFormStore.update('password', value);
						}}
						onFocus={() => setShowHint(true)}
					/>
					{isRegister && <AuthPassHint password={auth.password} showHint={showHint} />}
				</div>

				{isRegister && (
					<div className="relative">
						<Input
							className="core-auth-input rounded-t-none"
							id="passwordConfirm"
							leftIcon={<IconPass />}
							placeholder="Подтвердите пароль"
							required
							rightIcon={renderPasswordToggle()}
							type={showPassword ? 'text' : 'password'}
							value={auth.passwordConfirm}
							variant={isMobile ? 'ghost' : 'default'}
							onChange={(event) => {
								const value = event.target.value;
								if (validatePassword(value)) authFormStore.update('passwordConfirm', value);
							}}
						/>
					</div>
				)}

				{!isRegister && <a className="mt-2 flex self-end text-sm">Забыли пароль?</a>}

				<Button
					className="mt-6 h-8 w-full"
					disabled={isRegister && auth.password !== auth.passwordConfirm}
					type="submit"
				>
					{isRegister ? 'Зарегистрироваться' : 'Войти'}
				</Button>
			</form>

			{!isRegister && (
				<a
					onClick={() => {
						authFormStore.update('authType', 'register');
						appStore.setBack(() => {
							authFormStore.update('authType', 'login');
							appStore.resetBack();
						});
					}}
				>
					Нет аккаунта? Зарегистрироваться
				</a>
			)}
		</div>
	);
};

export default observer(AuthForm);
