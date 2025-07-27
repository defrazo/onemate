import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { authFormStore, authStore } from '@/features/user-auth';
import { supabase } from '@/shared/lib/supabase';
import { modalStore } from '@/shared/stores';
import AuthContainer from '@/widgets/authorization';

export const useAuthCallback = () => {
	const navigate = useNavigate();

	useEffect(() => {
		const handleAuthCallback = async () => {
			try {
				const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
				if (sessionError) throw new Error(sessionError.message);
				if (!sessionData.session) throw new Error('Сессия не найдена');

				const { user } = sessionData.session;
				const isRecovery = Boolean(user.recovery_sent_at);

				const { data: userData, error: authError } = await supabase.auth.getUser();
				if (authError || !userData.user) throw new Error('Не удалось получить пользователя');
				await authStore.oAuth({ data: userData, error: null });

				if (isRecovery) {
					authFormStore.setResetMode(true);
					authFormStore.update('authType', 'reset');
					authFormStore.update('email', user.email || '');
					modalStore.setModal(<AuthContainer />);
				} else navigate('/');
			} catch {
				navigate('/');
			}
		};

		handleAuthCallback();
	}, [navigate]);
};
