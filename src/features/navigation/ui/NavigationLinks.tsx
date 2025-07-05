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
						'flex-col gap-1 md:flex-row md:gap-2 hover:text-[var(--accent-hover)]',
						isMobile && order && `order-${order}`
					);

					const commonProps = {
						className: itemClass,
						size: isMobile ? 'custom' : 'md',
						variant: 'mobile',
					};

					const content = (
						<>
							<span className="size-6">{icon}</span>
							<span className={isMobile ? 'leading-4' : undefined}>{label}</span>
						</>
					);

					return onClick ? (
						<Button key={label} {...commonProps} onClick={onClick}>
							{content}
						</Button>
					) : (
						<Link key={label} {...commonProps} to={to}>
							{content}
						</Link>
					);
				})}
		</nav>
	);
};

export default NavigationLinks;
