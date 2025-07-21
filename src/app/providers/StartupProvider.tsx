import { useEffect, useState } from 'react';

import { rootStore } from '@/shared/stores';
import { LoadFallback } from '@/shared/ui';

import App from '../App';

const StartupProvider = () => {
	const [ready, setReady] = useState(false);

	useEffect(() => {
		rootStore.init().finally(() => setReady(true));
	}, []);

	if (!ready) return <LoadFallback />;

	return <App />;
};

export default StartupProvider;
