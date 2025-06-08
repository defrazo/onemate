import { observer } from 'mobx-react-lite';

import { cn } from '@/shared/lib/utils';
import { Button, Link } from '@/shared/ui';

import { getNavItems } from '../model';

interface NavMenuProps {
	isAuth: boolean;
	className?: string;
	variant?: 'desktop' | 'mobile';
}

const NavMenu = ({ isAuth, className, variant = 'desktop' }: NavMenuProps) => {
	const items = getNavItems(isAuth);
	const isMobile = variant === 'mobile';

	return (
		<nav className={cn(className)}>
			{items.map(({ to, icon, label, onClick, orderMobile }) => {
				const itemClass = cn(
					'flex-col md:flex-row md:gap-2 core-elements',
					isMobile && orderMobile === 1 && `order-1`,
					isMobile && orderMobile === 2 && `order-2`,
					isMobile && orderMobile === 3 && `order-3`
				);
				const content = (
					<>
						<span className="size-6">{icon}</span>
						{isMobile && <span>{label}</span>}
						{!isMobile && label}
					</>
				);

				return onClick ? (
					<Button key={label} className={itemClass} size={isMobile ? 'custom' : 'md'} onClick={onClick}>
						{content}
					</Button>
				) : (
					<Link key={label} className={itemClass} size={isMobile ? 'custom' : 'md'} to={to}>
						{content}
					</Link>
				);
			})}
		</nav>
	);
};

export default observer(NavMenu);
