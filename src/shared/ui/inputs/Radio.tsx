import { cn } from '@/shared/lib/utils';

interface RadioOption {
	value: string;
	label: string;
	disabled?: boolean;
}

interface RadioProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size' | 'value'> {
	value?: string | null;
	defaultValue?: string;
	options: RadioOption[];
	error?: boolean;
	variant?: 'default' | 'ghost' | 'custom';
	size?: 'sm' | 'md' | 'lg';
}

const Radio = ({
	value,
	defaultValue,
	options,
	error = false,
	variant = 'default',
	size = 'md',
	onChange,
	className,
	...props
}: RadioProps) => {
	const base = cn(
		'ring-[var(--accent-hover)] ',
		'transition-colors outline-none ring-inset',
		'focus:outline-none',
		'cursor-pointer appearance-none rounded-full border-1'
	);

	const variants = {
		default: cn('bg-[var(--bg-tertiary)]', 'enabled:hover:border-[var(--accent-hover)]'),
		ghost: cn(
			'border-[var(--border-color)] bg-transparent',
			'enabled:hover:border-[var(--accent-hover)]',
			'border-2'
		),
		custom: '',
	};

	const sizes = {
		sm: 'h-4 w-4',
		md: 'h-5 w-5',
		lg: 'h-6 w-6',
	};

	const states = {
		error: 'border-[var(--status-error)] focus:border-[var(--status-error)] focus:ring-[var(--status-error)]',
		disabled: 'text-[var(--color-disabled)] cursor-not-allowed',
	};

	return (
		<div className={cn('flex gap-2', className)}>
			{options.map((option) => {
				const isDisabled = props.disabled || option.disabled;

				return (
					<label
						key={option.value}
						className={cn(
							'flex items-center gap-2 select-none',
							isDisabled ? states.disabled : 'cursor-pointer'
						)}
					>
						<input
							checked={value === option.value}
							className={cn(
								base,
								sizes[size],
								variants[variant],
								error && states.error,
								isDisabled && states.disabled
							)}
							defaultChecked={defaultValue === option.value}
							disabled={isDisabled}
							type="radio"
							value={option.value}
							onChange={onChange}
							{...props}
						/>
						<span className={isDisabled ? 'opacity-50' : ''}>{option.label}</span>
					</label>
				);
			})}
		</div>
	);
};

export default Radio;
