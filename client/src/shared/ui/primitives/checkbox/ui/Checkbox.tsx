import { IconSquare, IconSquareCheck } from '@tabler/icons-react';
import type { InputHTMLAttributes } from 'react';

import { resolveStyles, type variants } from '@/shared/lib/design';
import { cn } from '@/shared/lib/utils';

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'checked' | 'onChange'> {
	checked: boolean;
	onChange: (checked: boolean) => void;

	label?: string;
	labelSide?: 'left' | 'right';

	size?: 'sm' | 'md' | 'lg';
	error?: boolean;

	variant?: keyof typeof variants.checkbox;
}

const sizes = {
	sm: 'size-4',
	md: 'size-5',
	lg: 'size-6',
};

export const Checkbox = ({
	checked,
	onChange,

	label,
	labelSide = 'right',

	size = 'md',
	error = false,

	variant = 'default',

	disabled,
	className,
	...props
}: CheckboxProps) => {
	const styles = resolveStyles({
		component: 'checkbox',
		variant,
	});

	const Icon = checked ? IconSquareCheck : IconSquare;

	return (
		<label
			className={cn(
				'group/checkbox flex w-fit items-center gap-2 select-none',
				labelSide === 'left' && 'flex-row-reverse',
				disabled ? 'cursor-not-allowed' : 'cursor-pointer',
				className
			)}
		>
			<input
				{...props}
				aria-invalid={error || undefined}
				checked={checked}
				className="peer sr-only"
				disabled={disabled}
				type="checkbox"
				onChange={(event) => onChange(event.target.checked)}
			/>
			<Icon
				className={cn(
					styles,
					sizes[size],
					'text-(--text-secondary) transition-colors group-hover/checkbox:text-(--accent-primary-hover)',
					'peer-disabled:opacity-50 peer-disabled:group-hover/checkbox:text-current',
					'peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-(--accent-primary)',
					'peer-aria-invalid:text-(--status-error)'
				)}
			/>
			{label && (
				<span className="transition-colors group-hover/checkbox:text-(--accent-primary-hover) peer-disabled:opacity-50 peer-disabled:group-hover/checkbox:text-current">
					{label}
				</span>
			)}
		</label>
	);
};
