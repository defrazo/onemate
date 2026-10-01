import { useEffect, useState } from 'react';
import { IconAlertCircle } from '@tabler/icons-react';

import { App } from '@/app/App';
import { SplashScreen } from '@/shared/ui';

import { getRootStore, StoreProvider } from '../store';

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

	if (state === 'loading') return <SplashScreen />;

	if (state === 'error') {
		return (
			<div className="flex h-full flex-1 cursor-default items-center justify-center px-4 select-none">
				<div className="flex w-full max-w-md flex-col items-center gap-2 rounded-2xl border border-[#fafafa12] bg-[#fafafa0d]/50 p-6 text-center shadow-(--shadow)">
					<div className="flex size-12 items-center justify-center rounded-xl bg-(--special-danger)/10">
						<IconAlertCircle className="size-6 text-(--special-danger)" />
					</div>
					<h2 className="text-xl font-semibold">Не удалось загрузить OneMate</h2>
					{error?.message && (
						<div className="w-full rounded-xl bg-white/3 px-3 py-2.5">
							<p className="flex flex-col text-xs wrap-break-word">
								<span>Произошла ошибка при инициализации приложения:</span>
								<span className="text-(--text-secondary) opacity-50">{error.message}</span>
							</p>
						</div>
					)}
					<button
						className="mt-2 h-8 cursor-pointer rounded-xl bg-(--accent-primary)/80 px-4 text-(--text-primary) transition-colors hover:bg-(--accent-primary-hover)"
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

export const StartupProvider = () => {
	return (
		<StoreProvider>
			<AppInitializer />
		</StoreProvider>
	);
};
