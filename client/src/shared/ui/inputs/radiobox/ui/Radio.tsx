import type { InputHTMLAttributes } from 'react';

import { getComponentStyles, type sizes, type variants } from '@/shared/lib/design';
import { cn } from '@/shared/lib/utils';

interface RadioOption {
	value: string | null;
	label: string;
	disabled?: boolean;
}

interface RadioProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'value'> {
	value?: string | null;
	options: RadioOption[];

	labelSide?: 'left' | 'right';
	error?: boolean;

	variant?: keyof typeof variants.radio;
	size?: keyof typeof sizes.radio;
}

export const Radio = ({
	value,
	options,

	labelSide = 'right',
	error = false,

	variant = 'default',
	size = 'md',

	disabled = false,
	className,
	onChange,
	...props
}: RadioProps) => {
	return (
		<div className={cn('flex gap-2', className)}>
			{options.map((option) => {
				const checked = value === option.value;
				const isDisabled = disabled || option.disabled;

				const styles = getComponentStyles({ variant, size, error, disabled: isDisabled, component: 'radio' });

				return (
					<label
						key={option.value ?? 'null'}
						className={cn(
							'group/radio flex items-center gap-2 select-none',
							labelSide === 'left' && 'flex-row-reverse',
							isDisabled ? 'cursor-not-allowed' : 'cursor-pointer'
						)}
					>
						<input
							{...props}
							checked={checked}
							className="sr-only"
							disabled={isDisabled}
							type="radio"
							value={option.value ?? ''}
							onChange={onChange}
						/>
						<span
							className={cn(
								styles,
								'flex shrink-0 items-center justify-center rounded-full border',
								checked
									? 'border-(--accent-primary)'
									: !isDisabled && 'group-hover/radio:border-(--accent-primary)'
							)}
						>
							<span
								className={cn(
									'size-2 rounded-full bg-(--accent-primary) transition-opacity',
									checked ? 'opacity-100' : 'opacity-0'
								)}
							/>
						</span>
						<span
							className={cn(
								styles,
								'flex w-fit items-center',
								!isDisabled && 'group-hover/radio:text-(--accent-primary)'
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
