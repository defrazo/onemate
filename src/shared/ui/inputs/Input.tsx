import { cn } from '@/shared/lib/utils';

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
	leftIcon?: React.ReactNode;
	rightIcon?: React.ReactNode;
	error?: boolean;
	variant?: 'default' | 'ghost' | 'custom';
	size?: 'sm' | 'md' | 'lg' | 'custom';
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
	const base = cn('w-full ring-[var(--accent-hover)]', 'transition-colors outline-none ring-inset', 'rounded-xl');

	const variants = {
		default: cn('bg-[var(--bg-tertiary)]'),
		ghost: cn('border-[var(--border-color)] bg-transparent', 'hover:border-[var(--accent-hover)]', 'border-1'),
		custom: '',
	};

	const sizes = {
		sm: 'text-sm py-1 px-2',
		md: 'text-base py-2 px-3',
		lg: 'text-lg py-3 px-4',
		custom: '',
	};

	const justifies = {
		start: 'justify-start',
		center: 'justify-center',
		end: 'justify-end',
	};

	const states = {
		error: 'ring-1 animate-pulse ring-[var(--status-error)] focus:ring-[var(--status-error)] focus:ring-[var(--status-error)]',
		disabled: 'text-[var(--color-disabled)] cursor-not-allowed',
	};

	const iconPadding = {
		leftPadding: leftIcon ? 'pl-10' : '',
		rightPadding: rightIcon ? 'pr-10' : '',
	};

	return (
		<div className={cn('relative flex w-full', justify && justifies[justify])}>
			{leftIcon && <span className="absolute left-0 h-full p-1.5">{leftIcon}</span>}
			{rightIcon && <span className="absolute right-0 h-full p-1.5">{rightIcon}</span>}
			<input
				className={cn(
					base,
					sizes[size],
					variants[variant],
					props.disabled && states.disabled,
					iconPadding.leftPadding,
					iconPadding.rightPadding,
					className,
					error && states.error
				)}
				{...props}
			/>
		</div>
	);
};

export default Input;
