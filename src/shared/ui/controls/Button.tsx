import { useNavigate } from 'react-router-dom';

import { cn } from '@/shared/lib/utils';

import { Preloader } from '../feedback';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
	leftIcon?: React.ReactNode;
	centerIcon?: React.ReactNode;
	rightIcon?: React.ReactNode;
	active?: boolean;
	loading?: boolean;
	navigateTo?: string;
	variant?: 'default' | 'ghost' | 'warning' | 'rounded' | 'mobile' | 'custom';
	size?: 'sm' | 'md' | 'lg' | 'custom';
}

const Button = ({
	children,
	leftIcon,
	centerIcon,
	rightIcon,
	active = false,
	loading = false,
	type = 'button',
	navigateTo,
	onClick,
	variant = 'default',
	size = 'md',
	className,
	...props
}: ButtonProps) => {
	const navigate = useNavigate();

	const base = cn(
		'flex items-center justify-center',
		'transition-colors outline-none ring-inset select-none',
		'enabled:cursor-pointer disabled:cursor-default'
	);

	const variants = {
		default: cn(
			'bg-[var(--bg-tertiary)]',
			'enabled:hover:bg-[var(--accent-hover)] enabled:hover:text-[var(--accent-text)]',
			'rounded-xl'
		),
		ghost: cn(
			'border-[var(--color-disabled)] border-[var(--border-color)] bg-transparent',
			'hover:border-[var(--accent-hover)] enabled:hover:bg-[var(--accent-hover)] enabled:hover:text-[var(--bg-accent-hover)]',
			'rounded-xl border-1'
		),
		warning: cn(
			'enabled:border-[var(--status-error)] enabled:text-[var(--status-error)] bg-transparent',
			'enabled:hover:border-[var(--accent-hover)] enabled:hover:bg-[var(--accent-hover)] enabled:hover:text-[var(--bg-accent-hover)]',
			'rounded-xl border-1'
		),
		rounded: cn(
			'bg-[var(--accent-default)] text-[var(--accent-text)]',
			'enabled:hover:bg-[var(--accent-hover)] enabled:hover:text-[var(--accent-text)]',
			'rounded-full'
		),
		// mobile: cn('bg-transparent border-none', 'active:bg-[var(--accent-hover)]', 'rounded-xl'),
		mobile: cn('bg-transparent border-none', 'rounded-xl'),
		custom: cn('rounded-xl'),
	};

	const sizes = {
		sm: 'text-sm py-1 px-3',
		md: 'text-base py-2 px-4',
		lg: 'text-lg py-3 px-6',
		custom: '',
	};

	const states = {
		disabled: 'opacity-60 cursor-not-allowed',
		loading: 'opacity-80 cursor-wait',
		active: 'bg-[var(--status-success)] text-[var(--color-primary)',
	};

	const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
		if (props.disabled || loading) return e.preventDefault();

		if (navigateTo) {
			e.preventDefault();
			navigate(navigateTo);
		}

		onClick?.(e);
	};

	return (
		<button
			className={cn(
				base,
				sizes[size],
				active ? states.active : variants[variant],
				props.disabled && states.disabled,
				loading && states.loading,
				className
			)}
			disabled={props.disabled || loading}
			type={type}
			onClick={handleClick}
			{...props}
		>
			{loading && <Preloader />}
			{leftIcon && <span className="mr-2">{leftIcon}</span>}
			{centerIcon ? <span>{centerIcon}</span> : children}
			{rightIcon && <span className="ml-2">{rightIcon}</span>}
		</button>
	);
};

export default Button;
