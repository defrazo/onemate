import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'mobx-react';

import App from '@/app/App';
import { userStore } from '@/entities/user';
import { userProfileStore } from '@/entities/userProfile';
import { authStore } from '@/features/auth';
import { appStore } from '@/shared/store/appStore';

import '../index.css';

const rootElement = document.getElementById('root');

if (rootElement) {
	const root = createRoot(rootElement);
	root.render(
		// <StrictMode>
		<Provider appStore={appStore} authStore={authStore} userProfileStore={userProfileStore} userStore={userStore}>
			<App />
		</Provider>
		// </StrictMode>
	);
} else {
	console.error('Element with id "root" not found');
}
