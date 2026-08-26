import type { InputHTMLAttributes } from 'react';

import { getComponentStyles, sizes, variants } from '@/shared/lib/ui-kit';
import { cn } from '@/shared/lib/utils';

interface RadioOption {
	value: string | null;
	label: string;
	disabled?: boolean;
}

interface RadioProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'value'> {
	value?: string | null;
	options: RadioOption[];
	error?: boolean;
	variant?: keyof typeof variants.radio;
	size?: keyof typeof sizes.radio;
	labelSide?: 'left' | 'right';
}

const Radio = ({
	value,
	options,
	onChange,
	variant = 'default',
	size = 'md',
	labelSide = 'right',
	error = false,
	className,
	...props
}: RadioProps) => {
	return (
		<div className={cn('flex gap-2', className)}>
			{options.map((option) => {
				const isDisabled = props.disabled || option.disabled;
				const styles = getComponentStyles({
					variant,
					size,
					error: error && !option.disabled,
					disabled: isDisabled,
					component: 'radio',
				});

				return (
					<label
						key={option.label}
						className={cn(
							'group flex items-center gap-2 select-none',
							labelSide === 'left' && 'flex-row-reverse',
							isDisabled ? 'pointer-events-none' : 'cursor-pointer'
						)}
					>
						<input
							checked={value === option.value}
							className={cn(
								styles,
								'rounded-full border border-solid',
								value === option.value
									? 'group-hover:border-none'
									: 'group-hover:border-(--accent-default)'
							)}
							disabled={isDisabled}
							type="radio"
							value={option.value ?? ''}
							onChange={onChange}
							{...props}
						/>
						<span className={cn(styles, 'flex w-fit items-center group-hover:text-(--accent-default)')}>
							{option.label}
						</span>
					</label>
				);
			})}
		</div>
	);
};

export default Radio;
