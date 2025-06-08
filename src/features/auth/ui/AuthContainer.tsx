import { useNavigate } from 'react-router-dom';
import { observer } from 'mobx-react-lite';

import { userStore } from '@/entities/user';
import { appStore } from '@/shared/store/appStore';

import { authFormStore, authStore } from '../model';
import { AuthForm } from '.';

interface AuthContainerProps {}

const AuthContainer = ({}: AuthContainerProps) => {
	const navigate = useNavigate();
	const isLogin = authFormStore.authForm.authType === 'login';

	const handleAuth = async () => {
		try {
			isLogin ? await authStore.login() : await authStore.register();
			authFormStore.reset();
			appStore.closeModal();
			appStore.setSuccess(`Добро пожаловать, ${userStore.username}!`);
			navigate('/main');
		} catch (err: any) {
			const fallback = isLogin ? 'Ошибка входа' : 'Ошибка регистрации';
			appStore.setError(err?.message || fallback);
		}
	};

	return <AuthForm onSubmit={handleAuth} />;
};

export default observer(AuthContainer);

export function openAuthContainer() {
	appStore.setModal(<AuthContainer />);
}
