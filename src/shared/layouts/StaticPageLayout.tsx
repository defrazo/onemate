import type { ReactNode } from 'react';

import { usePageTitle } from '@/shared/lib/hooks';
import { ScrollToTop, TableOfContents } from '@/shared/ui';

import { Layout } from '.';

interface StaticPageLayoutProps {
	children: ReactNode;
	title: string;
	showToc?: boolean;
}

export const StaticPageLayout = ({ children, title, showToc = true }: StaticPageLayoutProps) => {
	usePageTitle(title);

	return (
		<Layout hideLeftOnMobile hideRightOnMobile showFooter>
			<div className="mobile-pad mx-auto flex max-w-4xl">
				{showToc && <TableOfContents />}
				<div className="print-container flex flex-col items-center gap-4">{children}</div>
				<ScrollToTop />
			</div>
		</Layout>
	);
};
