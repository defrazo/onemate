import { useEffect, useState } from 'react';

import App from '@/app';
import { IconWarning } from '@/shared/assets/icons';
import { PreloaderExt } from '@/shared/ui';

import StoreProvider, { getRootStore } from '../store';

const rootStore = getRootStore();

const AppInitializer = () => {
	const [state, setState] = useState<'loading' | 'ready' | 'error'>(() =>
		rootStore.initialized ? 'ready' : 'loading'
	);
	const [error, setError] = useState<Error | null>(null);

	const initialize = async () => {
		setState('loading');
		setError(null);

		try {
			await rootStore.init();
			setState('ready');
		} catch (error) {
			setError(error instanceof Error ? error : new Error(String(error)));
			setState('error');
		}
	};

	useEffect(() => {
		if (rootStore.initialized) return;
		void initialize();
	}, []);

	if (state === 'loading') return <PreloaderExt />;

	if (state === 'error') {
		return (
			<div className="flex h-full flex-1 cursor-default items-center justify-center px-4 select-none">
				<div className="flex w-full max-w-md flex-col items-center gap-2 rounded-2xl border border-[#fafafa12] bg-[#fafafa0d]/50 p-6 text-center shadow-(--shadow)">
					<div className="flex size-12 items-center justify-center rounded-xl bg-(--warning-default)/10">
						<IconWarning className="size-6 text-(--warning-default)" />
					</div>
					<h2 className="text-xl font-semibold">Не удалось загрузить OneMate</h2>
					{error?.message && (
						<div className="w-full rounded-xl bg-white/[0.035] px-3 py-2.5">
							<p className="text-xs wrap-break-word text-(--color-secondary) opacity-50">
								{error.message}
							</p>
						</div>
					)}
					<button
						className="mt-2 h-8 cursor-pointer rounded-xl bg-(--accent-default)/80 px-4 text-(--color-primary) transition-colors hover:bg-(--accent-hover)"
						type="button"
						onClick={() => void initialize()}
					>
						Попробовать снова
					</button>
				</div>
			</div>
		);
	}

	return <App />;
};

const StartupProvider = () => {
	return (
		<StoreProvider>
			<AppInitializer />
		</StoreProvider>
	);
};

export default StartupProvider;
