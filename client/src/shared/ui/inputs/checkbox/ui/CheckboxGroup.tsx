import { IconSquare, IconSquareCheckFilled } from '@tabler/icons-react';
import type { InputHTMLAttributes } from 'react';

import { getComponentStyles, type sizes, type variants } from '@/shared/lib/design';
import { cn } from '@/shared/lib/utils';

interface CheckboxGroupOption {
	value: string;
	label: string;
	disabled?: boolean;
}

interface CheckboxGroupProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'value'> {
	value: string[];
	options: CheckboxGroupOption[];

	labelSide?: 'left' | 'right';
	error?: boolean;

	variant?: keyof typeof variants.checkbox;
	size?: keyof typeof sizes.checkbox;
}

export const CheckboxGroup = ({
	value,
	options,

	labelSide = 'right',
	error = false,

	variant = 'default',
	size = 'md',

	disabled = false,
	className,
	name,
	onChange,
	...props
}: CheckboxGroupProps) => {
	return (
		<div className={cn('flex flex-wrap gap-2', className)}>
			{options.map((option) => {
				const checked = value.includes(option.value);
				const isDisabled = disabled || option.disabled;

				const styles = getComponentStyles({
					variant,
					size,
					error,
					disabled: isDisabled,
					component: 'checkbox',
				});

				const Icon = checked ? IconSquareCheckFilled : IconSquare;

				return (
					<label
						key={option.value}
						className={cn(
							'group flex w-fit items-center gap-2 select-none',
							labelSide === 'left' && 'flex-row-reverse',
							isDisabled ? 'cursor-not-allowed' : 'cursor-pointer'
						)}
					>
						<input
							{...props}
							checked={checked}
							className="sr-only"
							disabled={isDisabled}
							name={name}
							type="checkbox"
							value={option.value}
							onChange={onChange}
						/>
						<Icon
							className={cn(
								styles,
								!isDisabled && 'transition-colors group-hover:text-(--accent-primary-hover)'
							)}
						/>
						<span
							className={cn(
								styles,
								'flex w-fit items-center',
								!isDisabled && 'transition-colors group-hover:text-(--accent-primary-hover)'
							)}
						>
							{option.label}
						</span>
					</label>
				);
			})}
		</div>
	);
};
