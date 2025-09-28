import type { ReactNode } from 'react';

import { useDeviceType, useOrientation } from '@/shared/lib/hooks';
import { cn } from '@/shared/lib/utils';
import Footer from '@/widgets/footer';
import Header from '@/widgets/header';
import MobileTabBar from '@/widgets/mobile-tab-bar';

interface LayoutProps {
	leftSide?: ReactNode;
	rightSide?: ReactNode;
	hideLeftOnMobile?: boolean;
	hideRightOnMobile?: boolean;
	children: ReactNode;
}

export const Layout = ({
	hideLeftOnMobile = false,
	hideRightOnMobile = false,
	leftSide,
	rightSide,
	children,
}: LayoutProps) => {
	const device = useDeviceType();
	const orientation = useOrientation();

	const left = hideLeftOnMobile && device === 'mobile' ? null : leftSide;
	const right = hideRightOnMobile && device === 'mobile' ? null : rightSide;
	const showMobileTabBar = device === 'mobile' || (device === 'tablet' && orientation === 'portrait');

	return (
		<div className="mx-auto flex min-h-screen w-full flex-col px-4 py-4 text-sm xl:min-h-full xl:max-w-[1600px] xl:text-base">
			<Header />
			<div
				className={cn(
					'grid flex-1 gap-4 pt-4 lg:py-4',
					left && right
						? 'grid-cols-[250px_1fr_250px]'
						: left
							? 'grid-cols-[250px_1fr]'
							: right
								? 'grid-cols-[1fr_250px]'
								: '',
					orientation === 'landscape' ? 'px-[25dvw] md:px-[10dvw] lg:px-0' : ''
				)}
			>
				{left && <aside className="flex">{left}</aside>}
				<main className="flex min-h-fit md:min-h-full">{children}</main>
				{right && <aside className="flex">{right}</aside>}
			</div>
			{showMobileTabBar ? <MobileTabBar /> : <Footer />}
		</div>
	);
};
