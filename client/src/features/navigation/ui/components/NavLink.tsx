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
		'flex flex-col items-center gap-1.5 rounded-lg px-2 py-1 transition-[color,background-color] duration-200 ease-out lg:min-w-24 lg:flex-row lg:gap-2 lg:px-3 lg:py-2 lg:font-bold',

		active
			? 'text-(--accent-default) lg:bg-(--accent-default)/12'
			: 'text-(--color-primary)/80 hover:text-(--accent-default) lg:bg-transparent lg:hover:bg-white/10',

		isPrimaryMobile && '-translate-y-2.5',
		isMobile && { 1: 'order-1', 2: 'order-2', 3: 'order-3', 4: 'order-4' }[item.order]
	);

	const content = (
		<>
			<span
				className={cn(
					'flex items-center justify-center',
					isPrimaryMobile
						? 'size-10 rounded-full bg-(--accent-default) text-(--accent-text) shadow-md ring-4 ring-(--bg-tertiary)'
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
		<Link className={className} size={isMobile ? 'custom' : 'md'} to={item.to} variant="mobile">
			{content}
		</Link>
	);
};
