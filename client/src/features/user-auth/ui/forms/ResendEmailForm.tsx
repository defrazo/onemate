import { useEffect, useState } from 'react';
import { IconMailFilled } from '@tabler/icons-react';
import { observer } from 'mobx-react-lite';

import { useStore } from '@/app/providers';
import { useValidation } from '@/shared/lib/hooks';
import { Button, Input, InputLabel } from '@/shared/ui';

import { emailCooldown } from '../../model';

export const ResendEmailForm = observer(() => {
	const { checkEmail } = useValidation();

	const { authFormStore, authStore, notifyStore, userStore } = useStore();

	const defaultEmail = userStore.pendingEmail || authFormStore.email || '';

	const [email, setEmail] = useState(defaultEmail);
	const [cooldown, setCooldown] = useState(emailCooldown.getRemaining());

	const isCooldown = cooldown > 0;

	const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
		e.preventDefault();

		if (!checkEmail(email)) return;

		try {
			if (userStore.isEmailPending) await userStore.resendPendingEmail();
			else await authStore.resendConfirmation(email);

			emailCooldown.start();
			setCooldown(emailCooldown.getRemaining());
			notifyStore.setNotice('Письмо отправлено. Проверьте почту', 'success');
		} catch {
			notifyStore.setNotice('Не удалось отправить письмо. Попробуйте позже', 'error');
		}
	};

	useEffect(() => {
		const nextEmail = userStore.pendingEmail || authFormStore.email || '';
		if (nextEmail && nextEmail !== email) setEmail(nextEmail);
	}, [userStore.pendingEmail, authFormStore.email]);

	useEffect(() => {
		const timerId = window.setInterval(() => setCooldown(emailCooldown.getRemaining()), 1000);
		return () => window.clearInterval(timerId);
	}, [cooldown]);

	return (
		<form className="flex w-full max-w-md flex-col gap-4" onSubmit={handleSubmit}>
			<Input
				id="email"
				leftIcon={<InputLabel htmlFor="email" icon={IconMailFilled} />}
				name="email"
				placeholder="Введите e-mail"
				type="email"
				value={email}
				variant="ghost"
				onChange={(e) => setEmail(e.target.value)}
			/>
			<Button
				className="core-elements mt-4 h-10 w-full"
				disabled={isCooldown}
				loading={authStore.isLoading}
				loadingText="Выполняется отправка..."
				type="submit"
			>
				{isCooldown ? `Отправить повторно через ${cooldown} сек.` : 'Отправить письмо повторно'}
			</Button>
		</form>
	);
});
