import { useEffect, useRef, useState } from 'react';
import { observer } from 'mobx-react-lite';

import App from '@/app';
import { IconWarning } from '@/shared/assets/icons';
import { PreloaderExt } from '@/shared/ui';

import StoreProvider, { getRootStore } from '../store';

interface StartupState {
	isReady: boolean;
	error: Error | null;
	isLoading: boolean;
}

const AppInitializer = observer(() => {
	const rootStore = getRootStore();
	const [state, setState] = useState<StartupState>({ isReady: false, error: null, isLoading: true });
	const initAttempted = useRef<boolean>(false);

	useEffect(() => {
		if (initAttempted.current || rootStore.initialized) {
			setState({ isReady: true, error: null, isLoading: false });
			return;
		}

		initAttempted.current = true;

		(async () => {
			try {
				await rootStore.init();
				setState({ isReady: true, error: null, isLoading: false });
			} catch (error) {
				setState({
					isReady: false,
					error: error instanceof Error ? error : new Error('Неизвестная ошибка'),
					isLoading: false,
				});
			}
		})();
	}, [rootStore]);

	if (state.error) {
		return (
			<div className="flex h-full flex-1 flex-col items-center justify-center gap-2">
				<IconWarning className="size-10 text-(--status-error)" />
				<h2 className="text-xl font-semibold text-(--status-error)">Ошибка загрузки OneMate</h2>
				<p className="text-(--color-disabled)">{state.error.message}</p>
				<button
					className="cursor-pointer rounded-xl bg-(--accent-default) px-4 py-2 text-(--color-primary) hover:bg-(--accent-hover)"
					type="button"
					onClick={() => {
						initAttempted.current = false;
						setState({ isReady: false, error: null, isLoading: true });
					}}
				>
					Попробовать снова
				</button>
			</div>
		);
	}

	if (state.isLoading || !state.isReady) return <PreloaderExt />;

	return <App />;
});

const StartupProvider = () => {
	return (
		<StoreProvider>
			<AppInitializer />
		</StoreProvider>
	);
};

export default StartupProvider;
