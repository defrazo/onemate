import { IconSquare, IconSquareCheck } from '@tabler/icons-react';
import type { InputHTMLAttributes } from 'react';

import { resolveStyles, type variants } from '@/shared/lib/design';
import { cn } from '@/shared/lib/utils';

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'checked' | 'onChange'> {
	checked: boolean;
	onChange: (checked: boolean) => void;

	label?: string;
	labelSide?: 'left' | 'right';

	error?: boolean;

	variant?: keyof typeof variants.checkbox;
}

export const Checkbox = ({
	checked,
	onChange,

	label,
	labelSide = 'right',

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
				'group flex w-fit items-center gap-2 select-none',
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
					'size-5 text-(--text-secondary) transition-colors group-hover:text-(--accent-primary-hover)',
					'peer-disabled:opacity-50 peer-disabled:group-hover:text-current',
					'peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-(--accent-primary)',
					'peer-aria-invalid:text-(--status-error)'
				)}
			/>
			{label && (
				<span className="transition-colors group-hover:text-(--accent-primary-hover) peer-disabled:opacity-50 peer-disabled:group-hover:text-current">
					{label}
				</span>
			)}
		</label>
	);
};
