import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { authStore, supabase } from '@/features/user-auth';
import { notifyStore } from '@/shared/stores';
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

			notifyStore.setSuccess('Вы успешно вошли через Google!');
		} catch {
			notifyStore.setError('Не удалось завершить вход через Google');
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
				{/* <Preloader className="h-15" /> */}
				<Preloader className="size-15" />
			</div>
		</div>
	);
};

export default AuthCallback;
