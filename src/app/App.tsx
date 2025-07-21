// import { HashRouter as Router, Route, Routes } from 'react-router-dom';
import { BrowserRouter as Router } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import { Toaster } from 'sonner';

import { useIsMobile } from '@/shared/lib/hooks';
import { ModalManager } from '@/shared/ui';

import AppRouter from './providers/router/Router';

const App = () => {
	const isMobile = useIsMobile();
	return (
		<Router>
			<AppRouter />
			<ModalManager />
			<Toaster duration={5000} position={isMobile ? 'top-center' : 'bottom-right'} />
		</Router>
	);
};

export default observer(App);
