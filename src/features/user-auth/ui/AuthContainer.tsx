import { useNavigate } from 'react-router-dom';
import { observer } from 'mobx-react-lite';

import { userStore } from '@/entities/user';
import { notifyStore, uiStore } from '@/shared/stores';

import { authFormStore, authStore } from '../model';
import { AuthForm } from '.';

const AuthContainer = () => {
	const navigate = useNavigate();

	const handleAuth = async () => {
		const isLogin = authFormStore.authType === 'login';

		try {
			isLogin ? await authStore.login() : await authStore.register();
			authFormStore.reset();
			uiStore.closeModal();

			notifyStore.setSuccess(`Добро пожаловать, ${userStore.username}!`);
			navigate('/main');
		} catch (error: any) {
			const fallback = isLogin ? 'Ошибка входа' : 'Ошибка регистрации';
			notifyStore.setError(error?.message || fallback);
		}
	};

	return <AuthForm onSubmit={handleAuth} />;
};

export default observer(AuthContainer);

export function openAuthContainer() {
	uiStore.setModal(<AuthContainer />);
}
