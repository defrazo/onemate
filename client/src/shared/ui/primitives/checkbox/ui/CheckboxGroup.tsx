import { IconSquare, IconSquareCheckFilled } from '@tabler/icons-react';
import type { InputHTMLAttributes } from 'react';

import { resolveStyles, type variants } from '@/shared/lib/design';
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
}

export const CheckboxGroup = ({
	value,
	options,

	labelSide = 'right',
	error = false,

	variant = 'default',

	disabled,
	className,
	name,
	onChange,
	...props
}: CheckboxGroupProps) => {
	const styles = resolveStyles({
		component: 'checkbox',
		variant,
	});

	return (
		<div className={cn('flex flex-wrap gap-2', className)}>
			{options.map((option) => {
				const checked = value.includes(option.value);
				const isDisabled = disabled || option.disabled;

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
							aria-invalid={error || undefined}
							checked={checked}
							className="peer sr-only"
							disabled={isDisabled}
							name={name}
							type="checkbox"
							value={option.value}
							onChange={onChange}
						/>
						<Icon
							className={cn(
								styles,
								'size-5 transition-colors group-hover:text-(--accent-primary-hover)',
								'peer-disabled:opacity-50 peer-disabled:group-hover:text-current',
								'peer-aria-invalid:text-(--status-error)'
							)}
						/>
						<span className="transition-colors group-hover:text-(--accent-primary-hover) peer-disabled:opacity-50 peer-disabled:group-hover:text-current">
							{option.label}
						</span>
					</label>
				);
			})}
		</div>
	);
};
