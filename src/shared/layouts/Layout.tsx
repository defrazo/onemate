import { ReactNode } from 'react';

import { useIsMobile } from '@/shared/lib/hooks';
import Footer from '@/widgets/footer';
import Header from '@/widgets/header';
import MobileTabBar from '@/widgets/mobile-tab-bar';

import { cn } from '../lib/utils';

interface LayoutProps {
	leftSide?: ReactNode;
	rightSide?: ReactNode;
	hideLeftOnMobile?: boolean;
	hideRightOnMobile?: boolean;
	children: ReactNode;
	showFooter?: boolean;
}

const Layout = ({
	hideLeftOnMobile = false,
	hideRightOnMobile = false,
	leftSide,
	rightSide,
	children,
	showFooter = true,
}: LayoutProps) => {
	const isMobile = useIsMobile();

	const left = hideLeftOnMobile && isMobile ? null : leftSide;
	const right = hideRightOnMobile && isMobile ? null : rightSide;

	return (
		<div className="mx-auto flex min-h-screen w-full max-w-[95vw] flex-col justify-between sm:max-w-[80vw] lg:max-w-[70vw] lg:px-8 xl:max-w-[1600px]">
			<Header />
			<div
				className={cn(
					'grid h-full w-full flex-1 grid-cols-1 gap-4',
					left && right
						? 'grid-cols-[250px_1fr_250px]'
						: left
							? 'grid-cols-[250px_1fr]'
							: right
								? 'grid-cols-[1fr_250px]'
								: 'grid-cols-1'
				)}
			>
				{left && <aside className="flex">{left}</aside>}
				<main className="flex min-w-0 flex-1 pb-16 md:pb-0">{children}</main>
				{right && <aside className="flex">{right}</aside>}
			</div>

			{showFooter && (isMobile ? <MobileTabBar /> : <Footer />)}
		</div>
	);
};

export default Layout;
