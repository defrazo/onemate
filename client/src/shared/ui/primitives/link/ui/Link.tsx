import type { ComponentProps, ReactNode } from 'react';
import { Link as RouterLink } from 'react-router-dom';

import { type Padding, resolveStyles, type variants } from '@/shared/lib/design';
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
	padding?: Padding;
}

export const Link = ({
	to,

	children,
	leftIcon,
	centerIcon,
	rightIcon,

	active,
	disabled,

	variant = 'default',
	padding = 'md',

	className,
	onClick,
	...props
}: LinkProps) => {
	const styles = resolveStyles({
		component: 'button',
		variant,
		padding,
		className: cn('group', className),
	});

	return (
		<RouterLink
			{...props}
			aria-current={active ? 'page' : undefined}
			aria-disabled={disabled || undefined}
			className={styles}
			tabIndex={disabled ? -1 : undefined}
			to={to}
			onClick={(event) => {
				if (disabled) {
					event.preventDefault();
					return;
				}

				onClick?.(event);
			}}
		>
			{leftIcon && <span className="mr-2">{leftIcon}</span>}
			{centerIcon ? <span>{centerIcon}</span> : children}
			{rightIcon && <span className="ml-2">{rightIcon}</span>}
		</RouterLink>
	);
};
