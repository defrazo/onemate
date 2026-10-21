import { observer } from 'mobx-react-lite';

import { useStore } from '@/app/providers';

import { AuthDemo, AuthDivider, AuthFooterLink, AuthFormHeader, AuthWrapper } from '../components';
import { LoginForm } from '../forms';

export const LoginScreen = observer(() => {
	const { authFormStore } = useStore();

	return (
		<AuthWrapper>
			<AuthFormHeader title="Войти в аккаунт" />
			<AuthDemo />
			<AuthDivider />
			<LoginForm />
			<AuthFooterLink
				action={() => authFormStore.switchToRegister()}
				linkText="Зарегистрироваться"
				text="Нет аккаунта?"
			/>
		</AuthWrapper>
	);
});
