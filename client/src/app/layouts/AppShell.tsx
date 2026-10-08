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
	landscapeMode?: boolean;
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
	landscapeMode = false,
	fillViewport = false,
}: AppShellProps) => {
	const { isMobile, isMobileLandscape } = useResponsive();

	const left = hideLeftOnMobile && isMobile ? null : leftSide;
	const right = hideRightOnMobile && isMobile ? null : rightSide;

	const showMobileTabBar = isMobile && !(isMobileLandscape && landscapeMode);

	return (
		<div className="relative min-h-svh">
			{background}
			<div
				className={cn(
					'mx-auto flex w-full flex-col px-4 pt-4 text-sm xl:max-w-400 xl:text-base',
					fillViewport && !isMobile ? 'h-svh lg:h-auto 2xl:h-svh' : 'min-h-svh',
					showMobileTabBar && 'pb-16',
					!isMobile && 'pb-4'
				)}
			>
				{!isMobileLandscape && <Header />}
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
				{!isMobile && !hideFooter && <Footer />}
			</div>
			{showMobileTabBar && <MobileTabBar />}
		</div>
	);
};
