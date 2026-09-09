import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { observer } from 'mobx-react-lite';

import { useStore } from '@/app/providers';
import { useValidation } from '@/shared/lib/hooks';
import { Button, PasswordInput, PasswordRules } from '@/shared/ui';

export const ResetForm = observer(({ email, token }: { email: string; token: string }) => {
	const navigate = useNavigate();
	const { checkPassword } = useValidation();

	const { authFormStore, authStore, notifyStore } = useStore();

	const [showHint, setShowHint] = useState(false);

	const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
		e.preventDefault();

		if (!checkPassword(authFormStore.password)) return;

		if (authFormStore.password !== authFormStore.passwordConfirm) {
			notifyStore.setNotice('Пароли не совпадают', 'info');
			return;
		}

		try {
			await authStore.resetPassword(email, token, authFormStore.password, authFormStore.passwordConfirm);

			notifyStore.setNotice('Пароль успешно изменён', 'success');
			navigate('/');
		} catch {
			notifyStore.setNotice('Проверьте введенные данные', 'error');
		}
	};

	return (
		<form className="flex w-full flex-col gap-4" onSubmit={handleSubmit}>
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
				<PasswordRules password={authFormStore.password} showHint={showHint} />
			</div>
			<PasswordInput
				autoComplete="new-password"
				id="password-confirm"
				name="password-confirm"
				placeholder="Подтвердите пароль"
				value={authFormStore.passwordConfirm}
				onChange={(e) => authFormStore.update('passwordConfirm', e.target.value)}
				onPaste={(e) => {
					e.preventDefault();
					notifyStore.setNotice('Подтвердите пароль, введя его вручную', 'error');
				}}
			/>
			<Button
				className="core-elements mt-4 h-10 w-full"
				loading={authStore.isLoading}
				loadingText="Выполняется сохранение..."
				type="submit"
			>
				Сохранить пароль
			</Button>
		</form>
	);
});
