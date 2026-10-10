import { useState } from 'react';
import { IconMailFilled } from '@tabler/icons-react';
import { observer } from 'mobx-react-lite';

import { useStore } from '@/app/providers';
import { useValidation } from '@/shared/lib/hooks';
import { Button, Input, InputLabel } from '@/shared/ui';

export const ForgotForm = observer(() => {
	const { checkEmail } = useValidation();

	const { authStore, modalStore, notifyStore } = useStore();

	const [email, setEmail] = useState('');

	const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
		e.preventDefault();

		if (!checkEmail(email)) return;

		try {
			await authStore.forgotPassword(email);

			notifyStore.setNotice('Инструкции отправлены на e-mail', 'success');
			modalStore.closeModal();
		} catch {
			notifyStore.setNotice('Что-то пошло не так', 'error');
		}
	};

	return (
		<form className="flex w-full max-w-md flex-col gap-3" onSubmit={handleSubmit}>
			<Input
				className="border-(--border-tone)"
				id="email"
				leftIcon={<InputLabel className="border-(--border-tone)" htmlFor="email" icon={IconMailFilled} />}
				placeholder="Введите e-mail"
				type="email"
				value={email}
				variant="ghost"
				onChange={(e) => setEmail(e.target.value)}
			/>
			<Button
				className="mt-4 h-8 w-full"
				loading={authStore.isLoading}
				loadingText="Выполняется отправка..."
				type="submit"
				variant="accent"
			>
				Отправить письмо
			</Button>
		</form>
	);
});
