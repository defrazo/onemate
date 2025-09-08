import { Preloader } from '@/shared/ui';

import { useAuthCallback } from '../model';

const AuthCallback = () => {
	useAuthCallback();

	return (
		<div className="flex min-h-screen items-center justify-center">
			<div className="flex flex-col items-center gap-2">
				<Preloader className="size-15" />
				<span className="animate-pulse text-xl font-medium">Подождите, выполняется вход...</span>
			</div>
		</div>
	);
};

export default AuthCallback;
