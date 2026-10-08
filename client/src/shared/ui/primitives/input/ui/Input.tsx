import type { InputHTMLAttributes, ReactNode } from 'react';

import { type Padding, resolveStyles, type variants } from '@/shared/lib/design';
import { cn } from '@/shared/lib/utils';

const alignStyles = {
	start: 'justify-start',
	center: 'justify-center',
	end: 'justify-end',
} as const;

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
	leftIcon?: ReactNode;
	rightIcon?: ReactNode;

	align?: keyof typeof alignStyles;
	error?: boolean;

	variant?: keyof typeof variants.input;
	padding?: Padding;
}

export const Input = ({
	leftIcon,
	rightIcon,

	align,
	error = false,

	variant = 'default',
	padding = 'md',

	disabled = false,
	className,
	...props
}: InputProps) => {
	const styles = resolveStyles({
		component: 'input',
		variant,
		padding,
		className: cn(leftIcon && 'pl-11.5', rightIcon && 'pr-11.5', className),
	});

	return (
		<div className={cn('relative flex w-full items-center', align && alignStyles[align])}>
			{leftIcon && <span className="absolute left-0 px-1.5">{leftIcon}</span>}
			{rightIcon && <span className="absolute right-0 px-1.5">{rightIcon}</span>}
			<input {...props} aria-invalid={error || undefined} className={styles} disabled={disabled} />
		</div>
	);
};
