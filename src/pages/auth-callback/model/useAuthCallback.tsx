import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { useStore } from '@/app/providers';
import AuthContainer from '@/widgets/authorization';

export const useAuthCallback = () => {
	const { authFormStore, authStore, modalStore, notifyStore, userStore } = useStore();
	const navigate = useNavigate();

	useEffect(() => {
		const handleAuthCallback = async () => {
			try {
				const user = await userStore.getSession();
				const isRecovery = Boolean(user.recovery_sent_at);

				if (await authStore.finishOAuth()) {
					notifyStore.setNotice(`Добро пожаловать, ${userStore.username}!`, 'success');

					if (isRecovery) {
						authFormStore.setResetMode(true);
						authFormStore.update('authType', 'reset');
						authFormStore.update('email', user.email || '');
						modalStore.setModal(<AuthContainer />);
					} else navigate('/dashboard');
				} else navigate('/');
			} catch (error: any) {
				notifyStore.setNotice(error.message || 'Произошла ошибка', 'error');
				navigate('/');
			}
		};

		handleAuthCallback();
	}, [navigate]);
};
