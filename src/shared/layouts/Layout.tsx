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
	hideFooter?: boolean;
	landscapeMode?: boolean;
	children: ReactNode;
}

export const Layout = ({
	leftSide,
	rightSide,
	hideLeftOnMobile = false,
	hideRightOnMobile = false,
	hideFooter = false,
	landscapeMode = false,
	children,
}: LayoutProps) => {
	const device = useDeviceType();
	const orientation = useOrientation();

	const left = hideLeftOnMobile && device === 'mobile' ? null : leftSide;
	const right = hideRightOnMobile && device === 'mobile' ? null : rightSide;
	const showMobileTabBar = device === 'mobile' || (device === 'tablet' && orientation === 'portrait');
	const landscape = orientation === 'landscape' && landscapeMode && device === 'mobile';

	return (
		<div className="mx-auto flex min-h-svh w-full flex-col pt-4 text-sm xl:max-w-400 xl:text-base">
			<div className="flex flex-1 flex-col px-4 pb-4">
				{!landscape && <Header />}
				<div
					className={cn(
						`grid flex-1 gap-4 ${landscape ? '' : 'pt-4'} md:pb-4`,
						left && right
							? 'grid-cols-[250px_1fr_250px]'
							: left
								? 'grid-cols-[250px_1fr]'
								: right
									? 'grid-cols-[1fr_250px]'
									: '',
						orientation === 'landscape' ? (landscapeMode ? '' : 'px-[25dvw] md:px-[10dvw] lg:px-0') : ''
					)}
				>
					{left && <aside className="flex">{left}</aside>}
					<main className="flex min-w-0 flex-1">{children}</main>
					{right && <aside className="flex">{right}</aside>}
				</div>
				{!showMobileTabBar && !hideFooter && <Footer />}
			</div>
			{showMobileTabBar && !(landscape && landscapeMode) && (
				<div className="h-12">
					<MobileTabBar />
				</div>
			)}
		</div>
	);
};
