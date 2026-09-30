import { Suspense } from 'react';
import { useRoutes } from 'react-router-dom';

import { routes } from '.';

export const RouterProvider = () => {
	const element = useRoutes(routes);
	return <Suspense fallback={null}>{element}</Suspense>;
};
