import type { InputHTMLAttributes } from 'react';

import { IconChecked, IconUnchecked } from '@/shared/assets/icons';
import { getComponentStyles, sizes, variants } from '@/shared/lib/ui-kit';
import { cn } from '@/shared/lib/utils';

interface CheckboxOption {
	value: string;
	label: string;
	disabled?: boolean;
}

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'value'> {
	value: string[];
	options: CheckboxOption[];
	variant?: keyof typeof variants.checkbox;
	size?: keyof typeof sizes.checkbox;
	labelSide?: 'left' | 'right';
	error?: boolean;
}

const Checkbox = ({
	name,
	value,
	options,
	onChange,
	variant = 'default',
	size = 'md',
	labelSide = 'right',
	error = false,
	className,
	...props
}: CheckboxProps) => {
	return (
		<div className={cn('flex flex-wrap gap-2', className)}>
			{options.map((option) => {
				const isDisabled = props.disabled || option.disabled;
				const styles = getComponentStyles({
					variant,
					size,
					error,
					disabled: isDisabled,
					component: 'checkbox',
				});

				return (
					<label
						key={option.value}
						className={cn(
							'group flex w-fit gap-2 select-none',
							labelSide === 'left' && 'flex-row-reverse',
							isDisabled ? 'pointer-events-none' : 'cursor-pointer'
						)}
					>
						<input
							checked={value.includes(option.value)}
							className="sr-only"
							disabled={isDisabled}
							name={name}
							type="checkbox"
							value={option.value}
							onChange={onChange}
							{...props}
						/>

						{value.includes(option.value) ? (
							<IconChecked className={cn(styles, 'group-hover:text-(--accent-hover)', className)} />
						) : (
							<IconUnchecked className={cn(styles, 'group-hover:text-(--accent-hover)', className)} />
						)}

						<span className={cn(styles, 'flex w-fit items-center group-hover:text-(--accent-hover)')}>
							{option.label}
						</span>
					</label>
				);
			})}
		</div>
	);
};

export default Checkbox;
