import { Link as RouterLink } from 'react-router-dom';

import { cn } from '@/shared/lib/utils';

interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
	leftIcon?: React.ReactNode;
	centerIcon?: React.ReactNode;
	rightIcon?: React.ReactNode;
	active?: boolean;
	to: string;
	variant?: 'default' | 'ghost' | 'rounded' | 'mobile' | 'custom';
	size?: 'sm' | 'md' | 'lg' | 'custom';
}

const Link = ({
	children,
	leftIcon,
	centerIcon,
	rightIcon,
	to,
	active = false,
	variant = 'default',
	size = 'md',
	className,
	...props
}: LinkProps) => {
	const base = cn(
		'flex items-center justify-center',
		'transition-colors outline-none ring-inset select-none',
		'cursor-pointer'
	);

	const variants = {
		default: cn(
			'bg-[var(--bg-tertiary)]',
			'hover:bg-[var(--accent-hover)] hover:text-[var(--accent-text)]',
			'rounded-xl'
		),
		ghost: cn(
			'border-[var(--border-color)] bg-transparent',
			'hover:border-[var(--accent-hover)] hover:bg-[var(--accent-hover)] hover:text-[var(--bg-accent-hover)]',
			'rounded-xl border-1'
		),
		rounded: cn(
			'bg-[var(--accent-default)] text-[var(--accent-text)]',
			'hover:bg-[var(--accent-hover)] hover:text-[var(--accent-text)]',
			'rounded-full'
		),
		mobile: cn('bg-transparent border-none', 'active:bg-[var(--accent-hover)]', 'rounded-xl'),
		custom: cn('rounded-xl'),
	};

	const sizes = {
		sm: 'text-sm py-1 px-3',
		md: 'text-base py-2 px-4',
		lg: 'text-lg py-3 px-6',
		custom: '',
	};

	const states = {
		active: 'bg-[var(--status-success)] text-[var(--color-primary)]',
	};

	return (
		<RouterLink
			className={cn(base, sizes[size], active ? states.active : variants[variant], className)}
			to={to}
			{...props}
		>
			{leftIcon && <span className="mr-2">{leftIcon}</span>}
			{centerIcon ? <span>{centerIcon}</span> : children}
			{rightIcon && <span className="ml-2">{rightIcon}</span>}
		</RouterLink>
	);
};

export default Link;
