import { observer } from 'mobx-react-lite';

import { useStore } from '@/app/providers';

import { AuthFooterLink, AuthFormHeader, AuthWrapper } from '../components';
import { ResendEmailForm } from '../forms';

export const ConfirmScreen = observer(() => {
	const { modalStore } = useStore();

	return (
		<AuthWrapper>
			<AuthFormHeader title="Подтверждение e-mail" />
			<p className="text-justify">
				Мы отправили письмо с подтверждением на адрес электронной почты. Пожалуйста, проверьте свою почту,
				включая папку «Спам».
			</p>
			<p className="text-justify text-(--color-disabled)">
				Если письмо не пришло, убедитесь, что адрес указан правильно и попробуйте запросить письмо повторно.
			</p>
			<ResendEmailForm />
			<AuthFooterLink action={() => modalStore.closeModal()} linkText="Вернуться на главную" />
		</AuthWrapper>
	);
});
