import { IconSquare, IconSquareCheck } from '@tabler/icons-react';
import type { InputHTMLAttributes } from 'react';

import { getComponentStyles, type sizes, type variants } from '@/shared/lib/design';
import { cn } from '@/shared/lib/utils';

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'checked' | 'onChange'> {
	checked: boolean;
	onChange: (checked: boolean) => void;

	label?: string;
	labelSide?: 'left' | 'right';

	error?: boolean;

	variant?: keyof typeof variants.checkbox;
	size?: keyof typeof sizes.checkbox;
}

export const Checkbox = ({
	checked,
	onChange,

	label,
	labelSide = 'right',

	error = false,

	variant = 'default',
	size = 'md',

	disabled = false,
	className,
	...props
}: CheckboxProps) => {
	const styles = getComponentStyles({ variant, size, error, disabled, component: 'checkbox' });

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
				checked={checked}
				className="sr-only"
				disabled={disabled}
				type="checkbox"
				onChange={(event) => onChange(event.target.checked)}
			/>
			<Icon className={cn(styles, !disabled && 'transition-colors group-hover:text-(--accent-hover)')} />
			{label && (
				<span
					className={cn(
						styles,
						'flex w-fit items-center',
						!disabled && 'transition-colors group-hover:text-(--accent-hover)'
					)}
				>
					{label}
				</span>
			)}
		</label>
	);
};
