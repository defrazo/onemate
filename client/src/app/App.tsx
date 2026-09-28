import { BrowserRouter } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import { Toaster } from 'sonner';

import { ModalManager } from '@/features/modal';
import { DemoBanner } from '@/pages/demo';
import { useDeviceType } from '@/shared/lib/hooks';

import { NotificationsProvider, RouterProvider, useStore } from './providers';

export const App = observer(() => {
	const device = useDeviceType();

	const { userStore } = useStore();

	return (
		<BrowserRouter>
			<NotificationsProvider>
				{userStore.id && userStore.userRole === 'demo' && <DemoBanner />}
				<RouterProvider />
				<ModalManager />
				<Toaster duration={5000} position={device === 'desktop' ? 'bottom-right' : 'top-left'} />
			</NotificationsProvider>
		</BrowserRouter>
	);
});
