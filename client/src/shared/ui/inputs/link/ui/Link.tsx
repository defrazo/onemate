import type { ComponentProps, ReactNode } from 'react';
import { Link as RouterLink } from 'react-router-dom';

import { getComponentStyles, sizes, variants } from '@/shared/lib/design';
import { cn } from '@/shared/lib/utils';

interface LinkProps extends Omit<ComponentProps<typeof RouterLink>, 'to'> {
	to: string;

	children?: ReactNode;
	leftIcon?: ReactNode;
	centerIcon?: ReactNode;
	rightIcon?: ReactNode;

	active?: boolean;
	disabled?: boolean;

	variant?: keyof typeof variants.button;
	size?: keyof typeof sizes.button;
}

export const Link = ({
	to,

	children,
	leftIcon,
	centerIcon,
	rightIcon,

	active = false,
	disabled = false,

	variant = 'default',
	size = 'md',

	className,
	onClick,
	...props
}: LinkProps) => {
	const styles = getComponentStyles({ variant, size, active, disabled, component: 'button' });

	return (
		<RouterLink
			{...props}
			aria-disabled={disabled || undefined}
			className={cn(styles, 'group', className)}
			tabIndex={disabled ? -1 : undefined}
			to={to}
			onClick={(e) => {
				if (disabled) {
					e.preventDefault();
					return;
				}

				onClick?.(e);
			}}
		>
			{leftIcon && <span className="mr-2">{leftIcon}</span>}
			{centerIcon ? <span>{centerIcon}</span> : children}
			{rightIcon && <span className="ml-2">{rightIcon}</span>}
		</RouterLink>
	);
};
