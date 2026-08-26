import { type FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { observer } from 'mobx-react-lite';

import { useStore } from '@/app/providers';
import { IconPass } from '@/shared/assets/icons';
import { Logo } from '@/shared/assets/images';
import { validatePasswords } from '@/shared/lib/validators';
import { Button, Input } from '@/shared/ui';

import { renderPasswordToggle } from '../lib';
import { PasswordHint } from '.';

export const ResetForm = observer(({ email, token }: { email: string; token: string }) => {
	const { authFormStore, authStore, notifyStore } = useStore();
	const navigate = useNavigate();

	const [showPassword, setShowPassword] = useState(false);
	const [showHint, setShowHint] = useState(false);
	const [isPasswordValid, setIsPasswordValid] = useState(false);
	const [isLoading, setIsLoading] = useState(false);

	const passwordToggleIcon = renderPasswordToggle({
		show: showPassword,
		toggle: () => setShowPassword((prev) => !prev),
		visible: !!authFormStore.password,
	});

	const handleSubmit = async (event: FormEvent) => {
		event.preventDefault();

		try {
			await validatePasswords(authFormStore.password, authFormStore.passwordConfirm);

			setIsLoading(true);

			await authStore.resetPassword(email, token, authFormStore.password, authFormStore.passwordConfirm);

			authFormStore.reset();

			notifyStore.setNotice('Пароль успешно изменён', 'success');

			navigate('/');
		} catch (error: any) {
			notifyStore.setNotice(error.message || 'Не удалось изменить пароль', 'error');
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="flex flex-col items-center gap-4 px-2 pb-4 md:w-lg md:p-0">
			<div className="flex flex-col items-center gap-2 select-none">
				<img alt="Логотип" className="size-20" decoding="async" loading="lazy" src={Logo} />
				<h1 className="core-header">Восстановить пароль OneMate</h1>
			</div>
			<div className="select-none">
				<p>Введите новый пароль</p>
			</div>
			<form className="flex w-full flex-col gap-4" onSubmit={handleSubmit}>
				<div className="relative">
					<Input
						autoComplete="new-password"
						leftIcon={<IconPass className="size-6 border-r border-(--border-color) pr-1" />}
						name="password"
						placeholder="Пароль"
						required
						rightIcon={passwordToggleIcon}
						type={showPassword ? 'text' : 'password'}
						value={authFormStore.password}
						variant="ghost"
						onBlur={(event) => {
							setShowHint(false);
							authFormStore.update('password', event.target.value.trim());
						}}
						onChange={(event) => authFormStore.update('password', event.target.value)}
						onFocus={() => setShowHint(true)}
					/>
					<PasswordHint
						password={authFormStore.password}
						showHint={showHint}
						onValidityChange={setIsPasswordValid}
					/>
				</div>
				<Input
					autoComplete="new-password"
					leftIcon={<IconPass className="size-6 border-r border-(--border-color) pr-1" />}
					name="password-confirm"
					placeholder="Подтвердите пароль"
					required
					rightIcon={passwordToggleIcon}
					type={showPassword ? 'text' : 'password'}
					value={authFormStore.passwordConfirm}
					variant="ghost"
					onBlur={(event) => authFormStore.update('passwordConfirm', event.target.value.trim())}
					onChange={(event) => authFormStore.update('passwordConfirm', event.target.value)}
					onPaste={(event) => {
						event.preventDefault();
						notifyStore.setNotice('Подтвердите пароль, введя его вручную', 'error');
					}}
				/>
				<Button
					className="core-elements mt-4 h-10 w-full"
					disabled={!isPasswordValid}
					loading={isLoading}
					type="submit"
				>
					Сохранить пароль
				</Button>
			</form>
		</div>
	);
});
