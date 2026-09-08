import { BrowserRouter } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import { Toaster } from 'sonner';

import { ModalManager } from '@/features/modal';
import { LS_CACHE_UI } from '@/shared/config';
import { useDeviceType } from '@/shared/lib/hooks';
import { storage } from '@/shared/lib/storage';
import { DemoBanner } from '@/shared/ui';

import { RouterProvider, useStore } from './providers';

export const App = observer(() => {
	const device = useDeviceType();

	const { userStore } = useStore();

	return (
		<BrowserRouter>
			{userStore.id && userStore.userRole !== 'user' && !storage.get(LS_CACHE_UI).demo && <DemoBanner />}
			<RouterProvider />
			<ModalManager />
			<Toaster duration={5000} position={device === 'desktop' ? 'bottom-right' : 'top-left'} />
		</BrowserRouter>
	);
});
