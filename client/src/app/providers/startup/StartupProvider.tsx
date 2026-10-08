import { useEffect, useState } from 'react';
import { IconAlertCircle } from '@tabler/icons-react';

import { App } from '@/app/App';
import { Button, SplashScreen } from '@/shared/ui';

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
				<div className="core-surface flex w-full max-w-md flex-col items-center gap-2 bg-(--bg-secondary) p-6 text-center shadow-(--shadow-contrast)">
					<div className="flex size-10 items-center justify-center rounded-md bg-(--status-error-muted)">
						<IconAlertCircle className="size-6 text-(--status-error)" />
					</div>
					<h2 className="text-xl font-semibold">Не удалось загрузить OneMate</h2>
					{error?.message && (
						<div className="w-full rounded-xl bg-(--tone) px-3 py-2.5">
							<p className="flex flex-col text-xs wrap-break-word">
								<span>Произошла ошибка при инициализации приложения:</span>
								<span className="text-(--text-secondary) opacity-50">{error.message}</span>
							</p>
						</div>
					)}
					<Button className="mt-2 h-7" type="button" variant="accent" onClick={() => void initialize()}>
						Попробовать снова
					</Button>
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
