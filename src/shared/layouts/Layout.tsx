import { ReactNode } from 'react';

import { useIsMobile } from '@/shared/lib/hooks';
import Footer from '@/widgets/Footer';
import Header from '@/widgets/Header';
import MobileTabBar from '@/widgets/MobileTabBar';

import { cn } from '../lib/utils';

interface LayoutProps {
	leftSide?: ReactNode;
	children: ReactNode;
	rightSide?: ReactNode;
	showFooter?: boolean;
}

// const Layout = ({ leftSide = null, children, rightSide = null, showFooter = true }: LayoutProps) => {
const Layout = ({ leftSide, children, rightSide, showFooter = true }: LayoutProps) => {
	const isMobile = useIsMobile();
	console.log('Layout leftSide:', leftSide);
	console.log('Layout rightSide:', rightSide);

	return (
		<div className="mx-auto flex min-h-screen w-full max-w-[95vw] flex-col justify-between sm:max-w-[80vw] lg:max-w-[70vw] lg:px-8 xl:max-w-[1600px]">
			<Header />
			<div
				className={cn(
					'grid h-full w-full flex-1 gap-4',
					leftSide && rightSide
						? 'grid-cols-[250px_1fr_250px]'
						: leftSide
							? 'grid-cols-[250px_1fr]'
							: rightSide
								? 'grid-cols-[1fr_250px]'
								: 'grid-cols-1'
				)}
			>
				{/* {leftSide && <aside className="flex">{leftSide}</aside>}
			
				{rightSide && <aside className="flex">{rightSide}</aside>} */}

				{leftSide ? <aside className="flex">{leftSide}</aside> : null}
				<main className="flex min-w-0 flex-1 pb-16 md:pb-0">{children}</main>
				{rightSide ? <aside className="flex">{rightSide}</aside> : null}
			</div>
			{showFooter && (isMobile ? <MobileTabBar /> : <Footer />)}
		</div>
	);
};

export default Layout;
