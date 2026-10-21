import { observer } from 'mobx-react-lite';

import { useStore } from '@/app/providers';

import { AuthFooterLink, AuthFormHeader, AuthWrapper, PrivacyConsent } from '../components';
import { RegisterForm } from '../forms';

export const RegisterScreen = observer(() => {
	const { authFormStore } = useStore();

	return (
		<AuthWrapper>
			<AuthFormHeader title="Создать аккаунт" />
			<RegisterForm />
			<PrivacyConsent
				checked={authFormStore.isPrivacyAccepted}
				onChange={(value) => authFormStore.update('privacyAccepted', value)}
			/>
			<AuthFooterLink action={() => authFormStore.switchToLogin()} linkText="Войти" text="Есть аккаунт?" />
		</AuthWrapper>
	);
});
