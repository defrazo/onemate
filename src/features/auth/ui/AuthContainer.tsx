import { useNavigate } from 'react-router-dom';
import { observer } from 'mobx-react-lite';

import { userStore } from '@/entities/user';
import { notifyStore, uiStore } from '@/shared/stores';

import { authFormStore, authStore } from '../model';
import { AuthForm } from '.';

interface AuthContainerProps {}

const AuthContainer = ({}: AuthContainerProps) => {
	const navigate = useNavigate();

	console.log(authFormStore.authForm.authType);
	const handleAuth = async () => {
		const isLogin = authFormStore.authForm.authType === 'login';
		console.log(isLogin);
		try {
			isLogin ? await authStore.login() : await authStore.register();
			authFormStore.reset();
			uiStore.closeModal();
			notifyStore.setSuccess(`Добро пожаловать, ${userStore.username}!`);
			navigate('/main');
		} catch (err: any) {
			const fallback = isLogin ? 'Ошибка входа' : 'Ошибка регистрации';
			notifyStore.setError(err?.message || fallback);
		}
	};

	return <AuthForm onSubmit={handleAuth} />;
};

export default observer(AuthContainer);

export function openAuthContainer() {
	// authFormStore.update('authType', 'login');
	uiStore.setModal(<AuthContainer />);
}
