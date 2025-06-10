import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { authStore, supabase } from '@/features/auth';
import { appStore } from '@/shared/store/appStore';
import { Preloader } from '@/shared/ui';

const AuthCallback = () => {
	const navigate = useNavigate();
	useEffect(() => {
		handleOAuth();
	}, [navigate]);

	const handleOAuth = async () => {
		try {
			const { data, error } = await supabase.auth.getUser();

			await authStore.oAuth({ data, error });

			appStore.setSuccess('Вы успешно вошли через Google!');
		} catch {
			appStore.setError('Не удалось завершить вход через Google');
		} finally {
			navigate('/');
		}
	};

	return (
		<div className="bg-background text-foreground flex min-h-screen items-center justify-center">
			<div className="flex flex-col items-center gap-2">
				<span className="text-muted-foreground animate-pulse text-xl font-medium">
					Подождите, выполняется вход...
				</span>
				<Preloader className="h-15" />
			</div>
		</div>
	);
};

export default AuthCallback;
