import { useNavigate } from 'react-router-dom';

import { userStore } from '@/entities/user';
import { authService } from '@/features/user-auth';
import { notifyStore } from '@/shared/stores';

export const useDeletedAccount = () => {
	const navigate = useNavigate();

	const handleRestore = async () => {
		try {
			await authService.restoreAccount();
			await userStore.checkDeleted();
			notifyStore.setNotice('Аккаунт успешно восстановлен!', 'success');
			navigate('/');
		} catch {
			notifyStore.setNotice('Не удалось восстановить аккаунт. Попробуйте позже.', 'error');
		}
	};

	const handleExit = async () => {
		await authService.logout();
		navigate('/');
	};

	return { handleRestore, handleExit };
};
