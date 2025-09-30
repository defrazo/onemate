import type { InputHTMLAttributes, ReactNode } from 'react';

import { getComponentStyles, sizes, variants } from '@/shared/lib/ui-kit';
import { cn } from '@/shared/lib/utils';

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
	leftIcon?: ReactNode;
	rightIcon?: ReactNode;
	error?: boolean;
	variant?: keyof typeof variants.input;
	size?: keyof typeof sizes.input;
	justify?: 'start' | 'center' | 'end';
}

const Input = ({
	leftIcon,
	rightIcon,
	error = false,
	variant = 'default',
	size = 'md',
	justify,
	className,
	...props
}: InputProps) => {
	const styles = getComponentStyles({ variant, size, error, disabled: props.disabled, component: 'input' });

	const justifies = {
		start: 'justify-start',
		center: 'justify-center',
		end: 'justify-end',
	};

	const iconPadding = {
		leftPadding: leftIcon ? 'pl-10' : '',
		rightPadding: rightIcon ? 'pr-10' : '',
	};

	return (
		<div className={cn('relative z-20 flex w-full items-center', justify && justifies[justify])}>
			{leftIcon && <span className="absolute left-0 px-1.5">{leftIcon}</span>}
			{rightIcon && <span className="absolute right-0 z-30 px-1.5">{rightIcon}</span>}
			<input className={cn(styles, iconPadding.leftPadding, iconPadding.rightPadding, className)} {...props} />
		</div>
	);
};

export default Input;
