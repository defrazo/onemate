import type { InputHTMLAttributes } from 'react';

import { resolveStyles, type variants } from '@/shared/lib/design';
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
}

export const Radio = ({
	value,
	options,

	labelSide = 'right',
	error = false,

	variant = 'default',

	disabled,
	className,
	onChange,
	...props
}: RadioProps) => {
	const styles = resolveStyles({
		component: 'radio',
		variant,
	});

	return (
		<div className={cn('core-gap flex', className)}>
			{options.map((option) => {
				const checked = value === option.value;
				const isDisabled = disabled || option.disabled;

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
							aria-invalid={error || undefined}
							checked={checked}
							className="peer sr-only"
							disabled={isDisabled}
							type="radio"
							value={option.value ?? ''}
							onChange={onChange}
						/>
						<span
							className={cn(
								styles,
								'flex size-5 shrink-0 items-center justify-center rounded-full border transition-colors group-hover/radio:border-(--accent-primary)',
								'peer-checked:border-(--accent-primary) peer-disabled:opacity-50 peer-disabled:group-hover/radio:border-(--border-primary)',
								'peer-aria-invalid:border-(--status-error)'
							)}
						>
							<span
								className={cn(
									'size-2 rounded-full bg-(--accent-primary) transition-opacity',
									checked ? 'opacity-100' : 'opacity-0'
								)}
							/>
						</span>
						<span className="trim transition-colors group-hover/radio:text-(--accent-primary) peer-disabled:opacity-50 peer-disabled:group-hover/radio:text-current">
							{option.label}
						</span>
					</label>
				);
			})}
		</div>
	);
};
