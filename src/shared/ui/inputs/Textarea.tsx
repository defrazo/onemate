import { cn } from '@/shared/lib/utils';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
	error?: boolean;
	variant?: 'default' | 'ghost' | 'custom';
	resize?: 'none' | 'vertical' | 'horizontal' | 'both';
	size?: 'sm' | 'md' | 'lg' | 'custom';
}

const Textarea = ({
	error = false,
	variant = 'default',
	resize = 'none',
	size = 'md',
	className,
	...props
}: TextareaProps) => {
	const base = cn('w-full ring-[var(--accent-hover)]', 'transition-colors outline-none ring-inset', 'rounded-xl');

	const variants = {
		default: cn('bg-[var(--bg-tertiary)]', 'hover:ring-1 focus:ring-1'),
		ghost: cn('border-[var(--border-color)] bg-transparent', 'hover:ring-1 focus:ring-1', 'border-1'),
		custom: '',
	};

	const sizes = {
		sm: 'text-sm py-1 px-2',
		md: 'text-base py-2 px-3',
		lg: 'text-lg py-3 px-4',
		custom: '',
	};

	const states = {
		error: 'border-[var(--status-error)] focus:border-[var(--status-error)] focus:ring-[var(--status-error)]',
		disabled: 'text-[var(--color-disabled)] cursor-not-allowed',
	};

	const resizeStyles = {
		none: 'resize-none',
		vertical: 'resize-y',
		horizontal: 'resize-x',
		both: 'resize',
	};

	return (
		<textarea
			className={cn(
				base,
				sizes[size],
				variants[variant],
				error && states.error,
				props.disabled && states.disabled,
				resizeStyles[resize],
				className
			)}
			{...props}
		/>
	);
};

export default Textarea;
