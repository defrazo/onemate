import { useNavigate } from 'react-router-dom';

import { useStore } from '@/app/providers';

export const useDeletedAccount = () => {
	const { accountStore, authStore, notifyStore, userStore } = useStore();
	const navigate = useNavigate();

	const handleRestore = async () => {
		try {
			await accountStore.restoreAccount();
			await userStore.loadUser();

			notifyStore.setNotice('Аккаунт успешно восстановлен!', 'success');
			navigate('/');
		} catch {
			notifyStore.setNotice('Не удалось восстановить аккаунт. Попробуйте позже.', 'error');
		}
	};

	const handleExit = async () => {
		authStore.logout();
		navigate('/');
	};

	return { handleRestore, handleExit };
};
