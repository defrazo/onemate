import { useNavigate } from 'react-router-dom';

import { useStore } from '@/app/providers';

export const useDeletedAccount = () => {
	const navigate = useNavigate();

	const { authStore, notifyStore, userStore } = useStore();

	const handleRestore = async () => {
		try {
			await userStore.restoreAccount();

			notifyStore.setNotice('Аккаунт успешно восстановлен!', 'success');
			navigate('/dashboard');
		} catch {
			notifyStore.setNotice('Не удалось восстановить аккаунт', 'error');
		}
	};

	const handleExit = async () => {
		await authStore.logout();
		navigate('/');
	};

	return { handleRestore, handleExit };
};
