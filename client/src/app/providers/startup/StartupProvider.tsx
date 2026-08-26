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
			<div className="flex h-full flex-1 cursor-default flex-col items-center justify-center gap-2 select-none">
				<IconWarning className="size-10 text-(--warning-default)" />
				<h2 className="text-xl font-semibold text-(--warning-default)">Ошибка загрузки OneMate</h2>
				<p className="text-(--color-disabled)">{error?.message}</p>
				<button
					className="cursor-pointer rounded-xl bg-(--accent-default) px-4 py-2 text-(--color-primary) hover:bg-(--accent-hover)"
					type="button"
					onClick={() => void initialize()}
				>
					Попробовать снова
				</button>
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
