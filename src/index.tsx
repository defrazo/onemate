import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'mobx-react';

import App from '@/app/App';
import { userStore } from '@/entities/user';
import { userProfileStore } from '@/entities/userProfile';
import { authStore } from '@/features/auth';
import { rootStore } from '@/shared/stores';

import '../index.css';

const rootElement = document.getElementById('root');

if (rootElement) {
	const root = createRoot(rootElement);
	root.render(
		// <StrictMode>
		<Provider authStore={authStore} rootStore={rootStore} userProfileStore={userProfileStore} userStore={userStore}>
			<App />
		</Provider>
		// </StrictMode>
	);
} else {
	console.error('Element with id "root" not found');
}
