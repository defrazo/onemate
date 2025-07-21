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
			notifyStore.setSuccess('Аккаунт успешно восстановлен!');
			navigate('/');
		} catch {
			notifyStore.setError('Не удалось восстановить аккаунт. Попробуйте позже.');
		}
	};

	const handleExit = async () => {
		await authService.logout();
		navigate('/');
	};

	return { handleRestore, handleExit };
};
