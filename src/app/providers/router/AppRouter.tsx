import { useRoutes } from 'react-router-dom';

import { routes } from './routerConfig';

const AppRouter = () => {
	return useRoutes(routes);
};

export default AppRouter;
