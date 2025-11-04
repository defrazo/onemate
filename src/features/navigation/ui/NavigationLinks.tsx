import { cn } from '@/shared/lib/utils';
import { Button, Link } from '@/shared/ui';

import { getNavItems } from '../model';

interface NavigationLinksProps {
	isAuth: boolean;
	className?: string;
	variant?: 'desktop' | 'mobile';
}

const NavigationLinks = ({ isAuth, className, variant = 'desktop' }: NavigationLinksProps) => {
	const items = getNavItems(isAuth);
	const isMobile = variant === 'mobile';

	return (
		<nav className={cn(className)}>
			{items
				.filter((item) => (isMobile ? item.label !== 'OneGen' : item.label !== 'Главная'))
				.map(({ to, icon, label, onClick, order }) => {
					const itemClass = cn(
						'flex-col gap-0.5 lg:flex-row lg:gap-2 mt-1 lg:mt-0',
						!isMobile && 'min-w-24 lg:px-0 ',
						isMobile &&
							order && {
								'order-1': order === 1,
								'order-2': order === 2,
								'order-3': order === 3,
								'order-4': order === 4,
							}
					);

					const commonProps = { className: itemClass, size: isMobile ? 'custom' : 'md', variant: 'mobile' };

					const content = (
						<>
							<span
								className={`${isMobile ? '' : 'text-(--accent-default)'} size-5 group-hover:text-(--accent-hover) lg:size-6`}
							>
								{icon}
							</span>
							<span
								className={
									isMobile ? 'text-xs leading-4 lg:text-xl' : 'group-hover:text-(--accent-hover)'
								}
							>
								{label}
							</span>
						</>
					);

					return onClick ? (
						<Button
							key={label}
							onContextMenu={(e) => e.preventDefault()}
							{...commonProps}
							onClick={onClick}
						>
							{content}
						</Button>
					) : (
						<Link key={label} onContextMenu={(e) => e.preventDefault()} {...commonProps} to={to}>
							{content}
						</Link>
					);
				})}
		</nav>
	);
};

export default NavigationLinks;
