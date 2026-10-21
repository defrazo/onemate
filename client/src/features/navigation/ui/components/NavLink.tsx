import { cn } from '@/shared/lib/utils';
import { Link } from '@/shared/ui';

import type { NavItem, NavVariant } from '../../model';

interface NavLinkProps {
	item: NavItem;
	active: boolean;
	variant: NavVariant;
}

export const NavLink = ({ item, active, variant }: NavLinkProps) => {
	const isMobile = variant === 'mobile';
	const isPrimary = isMobile && item.primaryMobile;

	const className = cn(
		'flex items-center justify-center rounded-lg transition-colors duration-200 ease-out',
		active ? 'text-(--accent-primary)' : 'text-(--text-primary)/80 hover:text-(--accent-primary)',
		isMobile
			? 'min-w-0 flex-1 flex-col gap-1 px-1 py-1 text-xs'
			: 'gap-2 px-3 py-1.5 font-bold hover:bg-(--tone-strong-hover)',
		!isMobile && active && 'bg-(--accent-primary)/12',
		isPrimary && '-translate-y-2.5'
	);

	const content = (
		<>
			<span
				className={cn(
					'flex shrink-0 items-center justify-center',
					isPrimary
						? 'size-10 rounded-full bg-(--accent-primary) text-(--text-on-accent) shadow-md ring-4 ring-(--bg-tertiary)'
						: isMobile
							? 'size-5'
							: 'size-5'
				)}
			>
				{item.icon}
			</span>
			<span className={cn('trim', isMobile ? 'text-xs' : 'text-sm', isPrimary && 'mt-1')}>{item.label}</span>
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
