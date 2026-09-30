import { IconChevronDown } from '@tabler/icons-react';

import { getComponentStyles, type sizes, type variants } from '@/shared/lib/design';
import { cn } from '@/shared/lib/utils';

import { type Direction, type Justify, type SelectOption, useSelect } from '../model';
import { List } from './components';

interface SelectProps {
	options: SelectOption[];
	value: string;
	onChange: (value: string) => void;

	placeholder?: string;
	variant?: keyof typeof variants.select;
	size?: keyof typeof sizes.select;
	direction?: Direction;
	align?: Justify;

	hideChevron?: boolean;
	clearable?: boolean;
	disabled?: boolean;
	error?: boolean;

	className?: string;
	listClassName?: string;
}

export const Select = ({
	options,
	value,
	onChange,
	placeholder = 'Выберите значение',
	variant = 'default',
	size = 'md',
	direction = 'auto',
	align = 'center',
	hideChevron = false,
	clearable = false,
	disabled = false,
	error = false,
	className,
	listClassName,
}: SelectProps) => {
	const { isOpen, openUpwards, wrapperRef, buttonRef, close, toggle } = useSelect(direction);

	const selectedOption = options.find((option) => option.value === value);
	const isEmbedded = variant === 'embedded';

	const alignments = {
		start: 'justify-start text-left',
		center: 'justify-center text-center',
		end: 'justify-end text-right',
	};

	const handleSelect = (value: string) => {
		onChange(value);
		close();
	};

	return (
		<div ref={wrapperRef} className="relative w-full">
			<button
				ref={buttonRef}
				aria-expanded={isOpen}
				aria-haspopup="listbox"
				className={cn(
					getComponentStyles({
						variant,
						size,
						error,
						disabled,
						component: 'select',
					}),
					'group relative flex w-full items-center gap-2',
					alignments[align],
					isOpen && isEmbedded && 'border-(--accent-default-op)',
					isOpen && isEmbedded && (openUpwards ? 'rounded-t-none' : 'rounded-b-none'),
					className
				)}
				disabled={disabled}
				type="button"
				onClick={toggle}
			>
				{selectedOption?.icon && (
					<img
						alt=""
						className="size-5 shrink-0 rounded-md"
						decoding="async"
						loading="lazy"
						src={selectedOption.icon}
					/>
				)}
				<span
					className={cn(
						'mt-0.5 min-w-0 truncate',
						!selectedOption &&
							'text-(--color-secondary) transition-colors group-hover:text-(--color-primary)',
						isOpen && 'text-(--accent-default)'
					)}
				>
					{selectedOption?.label ?? placeholder}
				</span>
				{!hideChevron && (
					<IconChevronDown
						className={cn(
							'absolute right-2 size-4 shrink-0 text-(--color-secondary) transition-[rotate,color] duration-200 ease-in-out',
							isOpen ? 'rotate-180 text-(--accent-default)' : 'rotate-0'
						)}
					/>
				)}
			</button>
			{isOpen && !disabled && (
				<List
					align={align}
					className={listClassName}
					clearable={clearable}
					openUpwards={openUpwards}
					options={options}
					value={value}
					variant={variant}
					onSelect={handleSelect}
				/>
			)}
		</div>
	);
};
