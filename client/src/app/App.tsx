import { observer } from 'mobx-react-lite';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'sonner';

import { ModalManager } from '@/features/modal';
import { DemoBanner } from '@/pages/demo';
import { useResponsive } from '@/shared/lib/hooks';

import { NotificationsProvider, RouterProvider, useStore } from './providers';

export const App = observer(() => {
	const { isDesktop } = useResponsive();

	const { userStore } = useStore();

	return (
		<BrowserRouter>
			<NotificationsProvider>
				{userStore.id && userStore.userRole === 'demo' && <DemoBanner />}
				<RouterProvider />
				<ModalManager />
				<Toaster duration={5000} position={isDesktop ? 'bottom-right' : 'top-right'} />
			</NotificationsProvider>
		</BrowserRouter>
	);
});
