import { observer } from 'mobx-react-lite';

import { useStore } from '@/app/providers';

import { AuthFooterLink, AuthFormHeader, AuthWrapper } from '../components';
import { ForgotForm } from '../forms';

export const ForgotScreen = observer(() => {
	const { authFormStore } = useStore();

	return (
		<AuthWrapper>
			<AuthFormHeader title="Восстановить пароль" />
			<p className="text-justify">
				Введите e-mail, к которому привязан ваш аккаунт OneMate. Мы отправим на него письмо с инструкциями по
				восстановлению пароля.
			</p>
			<p className="text-justify text-(--color-disabled)">
				Пожалуйста, проверьте почту, включая папку «Спам». Если письмо не придет, убедитесь, что адрес указан
				правильно и попробуйте запросить письмо повторно.
			</p>
			<ForgotForm />
			<AuthFooterLink action={() => authFormStore.switchToLogin()} linkText="Вернуться назад" />
		</AuthWrapper>
	);
});
