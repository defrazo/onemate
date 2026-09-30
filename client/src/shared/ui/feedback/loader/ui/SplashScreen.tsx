import './SplashScreen.css';

export const SplashScreen = () => {
	return (
		<div className="flex h-full flex-1 flex-col items-center justify-center gap-6 select-none">
			<div className="relative flex size-14 items-center justify-center">
				<div className="splash-glow absolute size-10 rounded-2xl bg-(--accent-default)/20 blur-lg" />
				<div className="splash-halo absolute size-5 rounded-lg border border-(--accent-default)/30" />
				<div className="splash-core relative size-3 rounded-sm bg-(--accent-default) shadow-[0_0_12px_var(--accent-default)]" />
			</div>
			<div className="flex flex-col items-center">
				<span className="font-bold tracking-[0.04em] text-(--color-primary)">OneMate</span>
				<span className="text-sm text-(--color-secondary)">Подготавливаем пространство</span>
			</div>
		</div>
	);
};
