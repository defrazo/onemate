import type { ButtonHTMLAttributes, MouseEvent, ReactNode } from 'react';

import { getComponentStyles, type sizes, type variants } from '@/shared/lib/design';
import { cn } from '@/shared/lib/utils';
import { Spinner } from '@/shared/ui';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
	children?: ReactNode;
	leftIcon?: ReactNode;
	centerIcon?: ReactNode;
	rightIcon?: ReactNode;
	loadingText?: ReactNode;

	loading?: boolean;
	active?: boolean;
	error?: boolean;

	variant?: keyof typeof variants.button;
	size?: keyof typeof sizes.button;
}

export const Button = ({
	children,
	leftIcon,
	centerIcon,
	rightIcon,
	loadingText,

	loading = false,
	active = false,
	error = false,

	variant = 'default',
	size = 'md',

	disabled = false,
	type = 'button',
	className,
	onClick,
	...props
}: ButtonProps) => {
	const isDisabled = disabled || loading;

	const styles = getComponentStyles({ variant, size, active, error, disabled: isDisabled, component: 'button' });

	const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
		if (isDisabled) return;
		onClick?.(e);
	};

	return (
		<button
			{...props}
			className={cn(styles, 'group', className)}
			disabled={isDisabled}
			type={type}
			onClick={handleClick}
		>
			{loading ? (
				<>
					<Spinner className="mr-2 size-4 border-2" />
					{loadingText ?? centerIcon ?? children}
				</>
			) : (
				<>
					{leftIcon && <span className="mr-2">{leftIcon}</span>}
					{centerIcon ? <span>{centerIcon}</span> : children}
					{rightIcon && <span className="ml-2">{rightIcon}</span>}
				</>
			)}
		</button>
	);
};
