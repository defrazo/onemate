import { Outlet } from 'react-router-dom';

import { usePageTitle } from '@/shared/lib/hooks';
import { ScrollToTop, TableOfContents } from '@/shared/ui';

import { AppShell } from './AppShell';

export const StaticPageLayout = ({ title, showToc = true }: { title: string; showToc?: boolean }) => {
	usePageTitle(title);

	return (
		<AppShell hideLeftOnMobile hideRightOnMobile>
			<div className="relative mx-auto w-full max-w-4xl print:max-w-none">
				{showToc && (
					<div className="absolute top-0 -left-14">
						<TableOfContents />
					</div>
				)}
				<div className="print-container w-full">
					<Outlet />
				</div>
				<ScrollToTop />
			</div>
		</AppShell>
	);
};
