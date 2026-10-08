import { cn } from '@/shared/lib/utils';
import { Link } from '@/shared/ui';

import type { NavItem } from '../../model';

interface NavLinkProps {
	item: NavItem;
	active: boolean;
	variant: 'desktop' | 'mobile';
}

export const NavLink = ({ item, active, variant }: NavLinkProps) => {
	const isMobile = variant === 'mobile';
	const isPrimaryMobile = isMobile && item.primaryMobile;

	const className = cn(
		'flex flex-col items-center h-full gap-1.5 rounded-lg px-2 py-1 transition-colors duration-200 ease-out lg:min-w-24 lg:flex-row lg:gap-2 lg:px-3 lg:py-1.5 lg:font-bold',
		active
			? 'text-(--accent-primary) lg:bg-(--accent-primary)/12'
			: 'text-(--text-primary)/80 hover:text-(--accent-primary) lg:bg-transparent lg:hover:bg-(--tone-strong-hover)',
		isPrimaryMobile && '-translate-y-2.5',
		isMobile && { 1: 'order-1', 2: 'order-2', 3: 'order-3', 4: 'order-4' }[item.order]
	);

	const content = (
		<>
			<span
				className={cn(
					'flex items-center justify-center',
					isPrimaryMobile
						? 'aspect-square size-10 rounded-full bg-(--accent-primary) text-(--text-on-accent) shadow-md ring-4 ring-(--bg-tertiary)'
						: 'size-5.5'
				)}
			>
				{item.icon}
			</span>
			<span className={cn('trim text-xs lg:text-base', isPrimaryMobile && 'mt-1')}>{item.label}</span>
		</>
	);

	if (item.external) {
		return (
			<a className={className} href={item.to} rel="noopener noreferrer" target="_blank">
				{content}
			</a>
		);
	}

	return (
		<Link className={className} padding="none" to={item.to} variant="custom">
			{content}
		</Link>
	);
};
