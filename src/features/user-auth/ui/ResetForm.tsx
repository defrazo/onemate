import { useState } from 'react';
import { observer } from 'mobx-react-lite';

import { IconPass } from '@/shared/assets/icons';
import { Logo } from '@/shared/assets/images';
import { notifyStore } from '@/shared/stores';
import { Button, Input } from '@/shared/ui';

import { renderPasswordToggle, validatePassword, validatePasswords } from '../lib';
import { authFormStore } from '../model';
import { PasswordHint } from '.';

interface ResetFormProps {
	onSubmit: () => void;
}

export const ResetForm = observer(({ onSubmit }: ResetFormProps) => {
	const [showPassword, setShowPassword] = useState(false);
	const [showHint, setShowHint] = useState(false);
	const store = authFormStore;

	const passwordToggleIcon = renderPasswordToggle({
		show: showPassword,
		toggle: () => setShowPassword((p) => !p),
		visible: !!store.password,
	});

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		try {
			await validatePasswords(store.password, store.passwordConfirm);
			onSubmit();
		} catch (error: any) {
			notifyStore.setError(error.message || 'Произошла ошибка');
		}
	};

	return (
		<div className="flex flex-col items-center gap-4 md:w-lg">
			<div className="flex flex-col items-center gap-2 select-none">
				<img alt="Логотип" className="size-20" src={Logo} />
				<h1 className="core-header">Восстановить пароль OneMate</h1>
			</div>
			<div className="select-none">
				<p>Введите ваш новый пароль</p>
			</div>
			<form className="flex w-full flex-col gap-4" onSubmit={handleSubmit}>
				<div className="relative">
					<Input
						leftIcon={<IconPass className="size-6 border-r border-[var(--border-color)] pr-1" />}
						placeholder="Пароль"
						required
						rightIcon={passwordToggleIcon}
						type={showPassword ? 'text' : 'password'}
						value={store.password}
						variant="ghost"
						onBlur={(event) => {
							setShowHint(false);
							store.update('password', event.target.value.trim());
						}}
						onChange={(event) => {
							const value = event.target.value;
							if (validatePassword(value)) store.update('password', value);
						}}
						onFocus={() => setShowHint(true)}
					/>
					<PasswordHint password={store.password} showHint={showHint} />
				</div>
				<Input
					leftIcon={<IconPass className="size-6 border-r border-[var(--border-color)] pr-1" />}
					placeholder="Подтвердите пароль"
					required
					rightIcon={passwordToggleIcon}
					type={showPassword ? 'text' : 'password'}
					value={store.passwordConfirm}
					variant="ghost"
					onBlur={(event) => store.update('passwordConfirm', event.target.value.trim())}
					onChange={(event) => store.update('passwordConfirm', event.target.value)}
					onPaste={(e) => {
						e.preventDefault();
						notifyStore.setError('Подтвердите пароль, введя его вручную');
					}}
				/>
				<Button className="mt-4 h-10 w-full" type="submit">
					Сохранить пароль
				</Button>
			</form>
		</div>
	);
});
