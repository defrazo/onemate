import { useLocation } from 'react-router-dom';

import { cn } from '@/shared/lib/utils';

import { isActiveRoute } from '../lib';
import { navItems, type NavVariant } from '../model';
import { NavLink } from './components';

export const Navbar = ({ variant = 'desktop' }: { variant?: NavVariant }) => {
	const { pathname } = useLocation();
	const isMobile = variant === 'mobile';

	const items = isMobile
		? navItems.filter((item) => item.mobile !== false).sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
		: navItems;

	const internalItems = items.filter((item) => !item.external);
	const externalItems = items.filter((item) => item.external);

	return (
		<nav
			className={cn(
				'no-touch-callout flex items-center',
				isMobile ? 'size-full justify-around gap-1' : 'w-fit gap-2 xl:gap-4'
			)}
		>
			{internalItems.map((item) => (
				<NavLink key={item.to} active={isActiveRoute(pathname, item.to)} item={item} variant={variant} />
			))}

			{!isMobile && externalItems.length > 0 && <div className="h-5 w-px bg-(--border-tone)/70" />}

			{externalItems.map((item) => (
				<NavLink key={item.to} active={false} item={item} variant={variant} />
			))}
		</nav>
	);
};
