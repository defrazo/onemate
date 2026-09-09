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

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
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
		<form className="flex w-full max-w-md flex-col gap-4" onSubmit={handleSubmit}>
			<Input
				className="border border-(--border-color) bg-(--bg-secondary)/50 pl-11.5 hover:border-(--accent-primary-hover)"
				id="email"
				leftIcon={<InputLabel htmlFor="email" icon={IconMailFilled} />}
				placeholder="Введите e-mail"
				type="email"
				value={email}
				onChange={(e) => setEmail(e.target.value)}
			/>
			<Button
				className="core-elements mt-4 h-10 w-full"
				loading={authStore.isLoading}
				loadingText="Выполняется отправка..."
				type="submit"
			>
				Отправить письмо
			</Button>
		</form>
	);
});
