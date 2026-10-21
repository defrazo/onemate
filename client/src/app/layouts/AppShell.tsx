import type { ReactNode } from 'react';

import { useResponsive } from '@/shared/lib/hooks';
import { cn } from '@/shared/lib/utils';
import { Footer } from '@/widgets/footer';
import { Header } from '@/widgets/header';
import { MobileTabBar } from '@/widgets/mobile-tab-bar';

interface AppShellProps {
	children: ReactNode;
	leftSide?: ReactNode;
	rightSide?: ReactNode;
	background?: ReactNode;
	hideLeftOnMobile?: boolean;
	hideRightOnMobile?: boolean;
	hideFooter?: boolean;
	fillViewport?: boolean;
}

export const AppShell = ({
	children,
	leftSide,
	rightSide,
	background,
	hideLeftOnMobile = false,
	hideRightOnMobile = false,
	hideFooter = false,
	fillViewport = false,
}: AppShellProps) => {
	const { isMobile, isTablet, isMobileLandscape } = useResponsive();

	const left = hideLeftOnMobile && isMobile && !isTablet ? null : leftSide;
	const right = hideRightOnMobile && isMobile && !isTablet ? null : rightSide;

	const showMobileTabBar = isMobile && !isTablet;

	return (
		<div className="relative flex min-h-svh flex-col">
			{background}
			<div
				className={cn(
					'mx-auto flex w-full flex-1 flex-col px-3 pt-3 text-sm lg:px-4 lg:pt-4 xl:max-w-400 xl:text-base',
					fillViewport && !isMobileLandscape
						? 'h-auto md:h-svh xl:h-auto lg:landscape:h-auto 2xl:landscape:h-svh'
						: 'min-h-svh',
					(!isMobile || isTablet) && 'pb-3 lg:pb-4'
				)}
			>
				<Header />
				<div
					className={cn(
						'core-gap grid min-h-0 flex-1 pt-4',
						left && right
							? 'grid-cols-[250px_minmax(0,1fr)_250px]'
							: left
								? 'grid-cols-[250px_minmax(0,1fr)]'
								: right
									? 'grid-cols-[minmax(0,1fr)_250px]'
									: 'grid-cols-[minmax(0,1fr)]'
					)}
				>
					{left && <aside className="flex min-h-0">{left}</aside>}
					<main className="flex min-h-0 min-w-0">{children}</main>
					{right && <aside className="flex min-h-0">{right}</aside>}
				</div>
				{(!isMobile || isTablet) && !hideFooter && <Footer />}
			</div>
			{showMobileTabBar && <MobileTabBar />}
		</div>
	);
};
