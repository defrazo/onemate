import { createRoot } from 'react-dom/client';
import { Provider } from 'mobx-react';

import StartupProvider from '@/app/providers';
import { rootStore } from '@/shared/stores';

import '../index.css';

const rootElement = document.getElementById('root');

if (rootElement) {
	const root = createRoot(rootElement);
	root.render(
		<Provider {...rootStore}>
			<StartupProvider />
		</Provider>
	);
}
