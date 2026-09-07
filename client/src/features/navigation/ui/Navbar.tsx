import { useLocation } from 'react-router-dom';

import { isActiveRoute } from '../lib';
import { navItems } from '../model';
import { NavLink } from './components';

export const Navbar = ({ variant = 'desktop' }: { variant?: 'desktop' | 'mobile' }) => {
	const { pathname } = useLocation();

	const isMobile = variant === 'mobile';

	const items = isMobile ? navItems.filter((item) => item.mobile !== false) : navItems;
	const internalItems = items.filter((item) => !item.external);
	const externalItems = items.filter((item) => item.external);

	return (
		<nav className="no-touch-callout flex h-12 w-full items-center justify-around gap-4 lg:h-10 lg:w-fit">
			{internalItems.map((item) => (
				<NavLink key={item.to} active={isActiveRoute(pathname, item.to)} item={item} variant={variant} />
			))}

			{!isMobile && externalItems.length > 0 && <div className="h-5 w-px bg-(--border-alt)" />}

			{externalItems.map((item) => (
				<NavLink key={item.to} active={false} item={item} variant={variant} />
			))}
		</nav>
	);
};
