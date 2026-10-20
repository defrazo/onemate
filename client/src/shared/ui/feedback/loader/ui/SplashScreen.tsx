import { APP_NAME } from '@/shared/config';

import './SplashScreen.css';

export const SplashScreen = () => {
	return (
		<div className="flex h-full flex-1 flex-col items-center justify-center gap-2 select-none">
			<div className="relative flex size-14 items-center justify-center">
				<div className="splash-glow absolute size-10 rounded-2xl bg-(--accent-primary)/20 blur-lg" />
				<div className="splash-halo absolute size-5 rounded-lg border border-(--accent-primary)/30" />
				<div className="splash-core relative size-3 rounded-sm bg-(--accent-primary) shadow-[0_0_12px_var(--accent-primary)]" />
			</div>
			<div className="z-10 flex flex-col items-center">
				<span className="font-bold tracking-[0.04em] text-(--text-primary)">{APP_NAME}</span>
				<span className="text-sm text-(--text-secondary)">Подготавливаем пространство</span>
			</div>
		</div>
	);
};
