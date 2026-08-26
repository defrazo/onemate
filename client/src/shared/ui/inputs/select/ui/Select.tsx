import type { SelectHTMLAttributes } from 'react';

import { IconDown } from '@/shared/assets/icons';
import { getComponentStyles, sizes, variants } from '@/shared/lib/ui-kit';
import { cn } from '@/shared/lib/utils';

interface SelectOption {
	value: string;
	label: string;
	disabled?: boolean;
}

interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
	options: SelectOption[];
	placeholder: string;
	variant?: keyof typeof variants.select;
	size?: keyof typeof sizes.select;
	error?: boolean;
	fullWidth?: boolean;
	align?: 'left' | 'center' | 'right';
}

const Select = ({
	options,
	placeholder,
	variant = 'default',
	size = 'md',
	error = false,
	fullWidth = false,
	align = 'left',
	className,
	...props
}: SelectProps) => {
	const styles = getComponentStyles({ variant, size, error, disabled: props.disabled, component: 'select' });

	const alignment = {
		left: 'text-start',
		center: 'text-center',
		right: 'text-end',
	};

	return (
		<div className="relative w-full">
			<select className={cn(styles, align && alignment[align], fullWidth && 'w-full', className)} {...props}>
				{placeholder && (
					<option className="core-base text-center" disabled value="">
						{placeholder}
					</option>
				)}
				{options.map((option) => (
					<option
						key={option.value}
						className="core-base cursor-pointer text-center"
						disabled={option.disabled}
						value={option.value}
					>
						{option.label}
					</option>
				))}
			</select>
			<div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2">
				<IconDown className="size-4" />
			</div>
		</div>
	);
};

export default Select;
