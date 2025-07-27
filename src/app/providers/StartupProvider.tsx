import { useEffect, useState } from 'react';

import { rootStore } from '@/shared/stores';

import App from '../App';

const StartupProvider = () => {
	const [ready, setReady] = useState<boolean>(false);

	useEffect(() => {
		rootStore.init().finally(() => setReady(true));
	}, []);

	if (!ready)
		return (
			<div className="flex h-full flex-1 flex-col items-center justify-center gap-2">
				<div className="loader" />
				<span className="animate-pulse text-xl font-medium">Загрузка OneMate</span>
			</div>
		);

	return <App />;
};

export default StartupProvider;
