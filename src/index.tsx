import { createRoot } from 'react-dom/client';
import { Provider } from 'mobx-react';

import App from '@/app/App';
import { userStore } from '@/entities/user';
import { userProfileStore } from '@/entities/user-profile';
import { authStore } from '@/features/user-auth';
import { rootStore } from '@/shared/stores';

import '../index.css';

const rootElement = document.getElementById('root');

if (rootElement) {
	const root = createRoot(rootElement);
	root.render(
		<Provider authStore={authStore} rootStore={rootStore} userProfileStore={userProfileStore} userStore={userStore}>
			<App />
		</Provider>
	);
} else {
	console.error('Element with id "root" not found');
}
