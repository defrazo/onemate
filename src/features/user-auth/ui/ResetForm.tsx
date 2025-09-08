import { type FormEvent, useState } from 'react';
import { observer } from 'mobx-react-lite';

import { useStore } from '@/app/providers';
import { IconPass } from '@/shared/assets/icons';
import { Logo } from '@/shared/assets/images';
import { validatePasswords } from '@/shared/lib/validators';
import { Button, Input } from '@/shared/ui';

import { renderPasswordToggle } from '../lib';
import { AuthFormStore } from '../model';
import { PasswordHint } from '.';

interface ResetFormProps {
	store: AuthFormStore;
	isLoading: boolean;
	onSubmit: () => void;
}

export const ResetForm = observer(({ store, isLoading, onSubmit }: ResetFormProps) => {
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
			await validatePasswords(store.password, store.passwordConfirm);

			onSubmit();
		} catch (error: any) {
			notifyStore.setNotice(error.message || 'Произошла ошибка', 'error');
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
					leftIcon={<IconPass className="size-6 border-r border-[var(--border-color)] pr-1" />}
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
				<Button className="mt-4 h-10 w-full" disabled={!isPasswordValid} loading={isLoading} type="submit">
					Сохранить пароль
				</Button>
			</form>
		</div>
	);
});
