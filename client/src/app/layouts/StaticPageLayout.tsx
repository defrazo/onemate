import { Outlet } from 'react-router-dom';

import { usePageTitle } from '@/shared/lib/hooks';
import { ScrollToTop, TableOfContents } from '@/shared/ui';

import { AppShell } from './AppShell';

export const StaticPageLayout = ({ title, showToc = true }: { title: string; showToc?: boolean }) => {
	usePageTitle(title);

	return (
		<AppShell hideLeftOnMobile hideRightOnMobile>
			<div className="mx-auto flex max-w-4xl">
				{showToc && <TableOfContents />}
				<div className="print-container flex flex-col items-center gap-4">
					<Outlet />
				</div>
				<ScrollToTop />
			</div>
		</AppShell>
	);
};
