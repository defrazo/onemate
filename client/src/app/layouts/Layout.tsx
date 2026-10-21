import type { ComponentProps } from 'react';
import { Outlet } from 'react-router-dom';

import { usePageTitle } from '@/shared/lib/hooks';

import { AppShell } from './AppShell';

interface LayoutProps extends Omit<ComponentProps<typeof AppShell>, 'children'> {
	title?: string;
}

export const Layout = ({ title, ...props }: LayoutProps) => {
	usePageTitle(title);

	return (
		<AppShell {...props}>
			<Outlet />
		</AppShell>
	);
};
