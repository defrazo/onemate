import { useState } from 'react';
import { observer } from 'mobx-react-lite';

import { IconPass, IconUser } from '@/shared/assets/icons';
import { Logo } from '@/shared/assets/images';
import { notifyStore, uiStore } from '@/shared/stores';
import { Button, Input } from '@/shared/ui';

import { renderPasswordToggle, validateLogin } from '../lib';
import { authFormStore } from '../model';
import { AuthSocial } from '.';

interface LoginFormProps {
	onSubmit: () => void;
}

export const LoginForm = observer(({ onSubmit }: LoginFormProps) => {
	const [showPassword, setShowPassword] = useState(false);
	const store = authFormStore;

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		try {
			await validateLogin(store.login);

			if (!store.password) {
				notifyStore.setError('Введите пароль');
				return;
			}

			onSubmit();
		} catch (error: any) {
			notifyStore.setError(error.message || 'Проверьте введенные данные');
		}
	};

	return (
		<div className="flex flex-col items-center gap-4 md:w-lg">
			<div className="flex flex-col items-center gap-2 select-none">
				<img alt="Логотип" className="size-20" src={Logo} />
				<h1 className="core-header">Войти в аккаунт OneMate</h1>
			</div>
			<AuthSocial />
			<div className="flex w-full items-center select-none">
				<div className="grow border-t border-[var(--border-color)]" />
				<span className="px-4">ИЛИ</span>
				<div className="grow border-t border-[var(--border-color)]" />
			</div>
			<form className="flex w-full flex-col gap-4" onSubmit={handleSubmit}>
				<Input
					leftIcon={<IconUser className="size-6 border-r border-[var(--border-color)] pr-1" />}
					placeholder="Имя пользователя или e-mail"
					required
					type="text"
					value={store.login}
					variant="ghost"
					onBlur={(e) => store.setLogin(e.target.value.trim())}
					onChange={(e) => store.setLogin(e.target.value)}
				/>
				<Input
					leftIcon={<IconPass className="size-6 border-r border-[var(--border-color)] pr-1" />}
					placeholder="Пароль"
					required
					rightIcon={renderPasswordToggle({
						show: showPassword,
						toggle: () => setShowPassword((p) => !p),
						visible: !!store.password,
					})}
					type={showPassword ? 'text' : 'password'}
					value={store.password}
					variant="ghost"
					onBlur={(event) => store.update('password', event.target.value.trim())}
					onChange={(event) => store.update('password', event.target.value)}
				/>
				<Button
					className="ml-auto text-sm"
					size="custom"
					variant="mobile"
					onClick={() => {
						store.update('authType', 'confirm');
						store.setResetMode(true);
						uiStore.setBack(() => {
							store.update('authType', 'login');
							uiStore.resetBack();
						});
					}}
				>
					Забыли пароль?
				</Button>
				<Button className="mt-4 h-10 w-full" type="submit">
					Войти
				</Button>
			</form>
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
		</div>
	);
});
