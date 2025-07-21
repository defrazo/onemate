import { Preloader } from '@/shared/ui';

import { useAuthCallback } from '../model';

const AuthCallback = () => {
	useAuthCallback();

	return (
		<div className="flex min-h-screen items-center justify-center">
			<div className="flex flex-col items-center gap-2">
				<span className="animate-pulse text-xl font-medium">Подождите, выполняется вход...</span>
				<Preloader className="size-15" />
			</div>
		</div>
	);
};

export default AuthCallback;
