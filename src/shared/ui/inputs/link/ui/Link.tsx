import type { AnchorHTMLAttributes, ReactNode } from 'react';
import { Link as RouterLink } from 'react-router-dom';

import { getComponentStyles, sizes, variants } from '@/shared/lib/ui-kit';
import { cn } from '@/shared/lib/utils';

interface LinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
	to: string;
	active?: boolean;
	disabled?: boolean;
	leftIcon?: ReactNode;
	centerIcon?: ReactNode;
	rightIcon?: ReactNode;
	variant?: keyof typeof variants.button;
	size?: keyof typeof sizes.button;
}

const Link = ({
	to,
	active = false,
	disabled,
	leftIcon,
	centerIcon,
	rightIcon,
	children,
	variant = 'default',
	size = 'md',
	className,
	...props
}: LinkProps) => {
	const styles = getComponentStyles({ variant, size, active, disabled: disabled, component: 'button' });

	return (
		<RouterLink className={cn(styles, className, 'group')} to={to} {...props}>
			{leftIcon && <span className="mr-2">{leftIcon}</span>}
			{centerIcon ? <span>{centerIcon}</span> : children}
			{rightIcon && <span className="ml-2">{rightIcon}</span>}
		</RouterLink>
	);
};

export default Link;
