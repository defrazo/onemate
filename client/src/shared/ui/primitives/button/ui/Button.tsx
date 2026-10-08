import type { ButtonHTMLAttributes, ReactNode } from 'react';

import { type Padding, resolveStyles, type variants } from '@/shared/lib/design';
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

	variant?: keyof typeof variants.button;
	padding?: Padding;
}

export const Button = ({
	children,
	leftIcon,
	centerIcon,
	rightIcon,
	loadingText,

	loading = false,
	active,

	variant = 'default',
	padding = 'md',

	disabled,
	type = 'button',
	className,
	...props
}: ButtonProps) => {
	const isDisabled = disabled || loading;

	const styles = resolveStyles({
		component: 'button',
		variant,
		padding,
		loading,
		className: cn('group', className),
	});

	return (
		<button
			{...props}
			aria-pressed={active}
			className={styles}
			data-loading={loading || undefined}
			disabled={isDisabled}
			type={type}
		>
			{loading ? (
				<>
					<Spinner className="mr-2 size-4 border-2 border-(--accent-secondary) border-t-(--text-disabled)" />
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
