import { BrowserRouter } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import { Toaster } from 'sonner';

import { useIsMobile } from '@/shared/lib/hooks';
import { LS_CACHE_UI, storage } from '@/shared/lib/storage';
import { DemoBanner, ModalManager } from '@/shared/ui';

import { RouterProvider, useStore } from './providers';

const App = () => {
	const { userStore } = useStore();
	const isMobile = useIsMobile();

	return (
		<BrowserRouter>
			{userStore.id && userStore.userRole !== 'user' && !storage.get(LS_CACHE_UI).demo && <DemoBanner />}
			<RouterProvider />
			<ModalManager />
			<Toaster duration={5000} position={isMobile ? 'top-center' : 'bottom-right'} />
		</BrowserRouter>
	);
};

export default observer(App);
