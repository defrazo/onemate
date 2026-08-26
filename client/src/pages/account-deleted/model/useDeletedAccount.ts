import { useNavigate } from 'react-router-dom';

import { useStore } from '@/app/providers';

export const useDeletedAccount = () => {
	const { accountStore, authStore, notifyStore } = useStore();
	const navigate = useNavigate();

	const handleRestore = async () => {
		try {
			await accountStore.restoreAccount();

			notifyStore.setNotice('Аккаунт успешно восстановлен!', 'success');

			navigate('/dashboard');
		} catch {
			notifyStore.setNotice('Не удалось восстановить аккаунт. Попробуйте позже.', 'error');
		}
	};

	const handleExit = async () => {
		await authStore.logout();
		navigate('/');
	};

	return { handleRestore, handleExit };
};
