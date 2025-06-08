import { IconChecked, IconUnchecked } from '@/shared/assets/icons';
import { cn } from '@/shared/lib/utils';

interface CheckboxBoolProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size' | 'value' | 'onChange'> {
	label?: string;
	checked: boolean;
	onChange: (checked: boolean) => void;
	error?: boolean;
	variant?: 'default' | 'custom';
	size?: 'sm' | 'md' | 'lg';
}

const CheckboxBool = ({
	label,
	checked,
	onChange,
	disabled = false,
	variant = 'default',
	size = 'md',
	className,
	...props
}: CheckboxBoolProps) => {
	const base = cn('ring-[var(--accent-hover)]', 'transition-colors outline-none ring-inset', 'cursor-pointer');

	const variants = {
		default: cn('hover:text-[var(--accent-hover)]'),
		custom: '',
	};

	const sizes = {
		sm: 'h-4 w-4',
		md: 'h-5 w-5',
		lg: 'h-6 w-6',
	};

	const states = {
		error: 'border-[var(--status-error)] focus:border-[var(--status-error)] focus:ring-[var(--status-error)]',
		disabled: 'text-[var(--color-disabled)] cursor-not-allowed hover:text-none',
	};

	return (
		<label className={cn('flex cursor-pointer items-center gap-2 select-none', className)}>
			<input
				checked={checked}
				className="sr-only"
				disabled={disabled}
				type="checkbox"
				onChange={(e) => onChange(e.target.checked)}
				{...props}
			/>
			{!disabled && checked ? (
				<IconChecked className={cn(base, sizes[size], variants[variant], disabled && states.disabled)} />
			) : (
				<IconUnchecked className={cn(base, sizes[size], variants[variant], disabled && states.disabled)} />
			)}
			{label && <span className="text-base">{label}</span>}
		</label>
	);
};

export default CheckboxBool;
