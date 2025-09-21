import type { InputHTMLAttributes } from 'react';

import { IconChecked, IconUnchecked } from '@/shared/assets/icons';
import { getComponentStyles, sizes, variants } from '@/shared/lib/ui-kit';
import { cn } from '@/shared/lib/utils';

interface CheckboxBoolProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'value' | 'onChange'> {
	checked: boolean;
	onChange: (checked: boolean) => void;
	disabled?: boolean;
	variant?: keyof typeof variants.checkboxBool;
	size?: keyof typeof sizes.checkboxBool;
	labelSide?: 'left' | 'right';
	label?: string;
	error?: boolean;
}

const CheckboxBool = ({
	checked,
	onChange,
	disabled = false,
	variant = 'default',
	size = 'md',
	labelSide = 'right',
	label,
	error,
	className,
	...props
}: CheckboxBoolProps) => {
	const styles = getComponentStyles({ variant, size, error, disabled: disabled, component: 'checkboxBool' });

	return (
		<label
			className={cn(
				'group flex w-fit gap-2 select-none',
				labelSide === 'left' && 'flex-row-reverse',
				disabled ? 'pointer-events-none' : 'cursor-pointer'
			)}
		>
			<input
				checked={checked}
				className="sr-only"
				disabled={disabled}
				type="checkbox"
				onChange={(e) => onChange(e.target.checked)}
				{...props}
			/>

			{!disabled && checked ? (
				<IconChecked className={cn(styles, 'group-hover:text-[var(--accent-hover)]', className)} />
			) : (
				<IconUnchecked className={cn(styles, 'group-hover:text-[var(--accent-hover)]', className)} />
			)}

			{label && (
				<span className={cn(styles, 'flex w-fit items-center group-hover:text-[var(--accent-hover)]')}>
					{label}
				</span>
			)}
		</label>
	);
};

export default CheckboxBool;
