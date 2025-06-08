import { cn } from '@/shared/lib/utils';

interface CheckboxOption {
	value: string;
	label: string;
	disabled?: boolean;
}

interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size' | 'value'> {
	value: string[];
	options: CheckboxOption[];
	error?: boolean;
	variant?: 'default' | 'ghost' | 'custom';
	size?: 'sm' | 'md' | 'lg';
}

const Checkbox = ({
	value,
	options,
	name,
	error = false,
	onChange,
	variant = 'default',
	size = 'md',
	className,
	...props
}: CheckboxProps) => {
	const base = cn(
		'ring-[var(--accent-hover)]',
		'transition-colors outline-none ring-inset',
		'focus:outline-none',
		'cursor-pointer appearance-none rounded-full border-2'
	);

	const variants = {
		default: cn('bg-[var(--bg-tertiary)]', 'hover:ring-2 focus:ring-2'),
		ghost: cn('border-[var(--border-color)] bg-transparent', 'hover:border-[var(--accent-hover)]'),
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
		<div className={cn('flex flex-wrap gap-4', className)}>
			{options.map((option) => (
				<label key={option.value} className="flex cursor-pointer items-center gap-2 select-none">
					<input
						checked={value.includes(option.value)}
						className={cn(
							base,
							sizes[size],
							variants[variant],
							error && states.error,
							(props.disabled || option.disabled) && states.disabled
						)}
						disabled={props.disabled || option.disabled}
						name={name}
						type="checkbox"
						value={option.value}
						onChange={onChange}
						{...props}
					/>
					<span className="text-base">{option.label}</span>
				</label>
			))}
		</div>
	);
};

export default Checkbox;
