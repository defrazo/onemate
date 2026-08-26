import type { ComponentProps } from 'react';
import { Outlet } from 'react-router-dom';

import { AppShell } from './AppShell';

type AppLayoutProps = Omit<ComponentProps<typeof AppShell>, 'children'>;

export const Layout = (props: AppLayoutProps) => {
	return (
		<AppShell {...props}>
			<Outlet />
		</AppShell>
	);
};
