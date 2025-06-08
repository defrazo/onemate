import { IconDown } from '@/shared/assets/icons';
import { cn } from '@/shared/lib/utils';

interface SelectOption {
	value: string;
	label: string;
	disabled?: boolean;
}

interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
	options: SelectOption[];
	placeholder: string;
	error?: boolean;
	variant?: 'default' | 'ghost' | 'custom';
	size?: 'sm' | 'md' | 'lg';
	fullWidth?: boolean;
	align?: 'left' | 'center' | 'right';
}

const Select = ({
	options,
	placeholder,
	error = false,
	variant = 'default',
	size = 'md',
	fullWidth = false,
	align = 'left',
	className,
	...props
}: SelectProps) => {
	const base = cn(
		'w-full ring-[var(--accent-hover)]',
		'transition-colors outline-none ring-inset',
		'focus:outline-none',
		'cursor-pointer appearance-none rounded-xl'
	);

	const variants = {
		default: cn('bg-[var(--bg-tertiary)]', ' focus:ring-1'),
		ghost: cn('border-[var(--border-color)] bg-transparent', 'hover:border-[var(--accent-hover)]', 'border-1'),
		custom: '',
	};

	const sizes = {
		sm: 'text-sm py-1 pl-2 pr-8',
		md: 'text-base py-2 pl-3 pr-8',
		lg: 'text-lg py-3 pl-4 pr-10',
	};

	const states = {
		error: 'border-[var(--status-error)] focus:border-[var(--status-error)] focus:ring-[var(--status-error)]',
		disabled: 'text-[var(--color-disabled)] cursor-not-allowed',
	};

	const alignment = {
		left: 'text-start',
		center: 'text-center',
		right: 'text-end',
	};

	return (
		<div className="relative w-full">
			<select
				className={cn(
					base,
					sizes[size],
					variants[variant],
					error && states.error,
					props.disabled && states.disabled,
					align && alignment[align],
					fullWidth && 'w-full',
					className
				)}
				{...props}
			>
				{placeholder && (
					<option disabled value="">
						{placeholder}
					</option>
				)}

				{options.map((option) => (
					<option key={option.value} disabled={option.disabled} value={option.value}>
						{option.label}
					</option>
				))}
			</select>
			<div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2">
				<IconDown className="size-4" />
			</div>
		</div>
	);
};

export default Select;
