import { IconChevronDown } from '@tabler/icons-react';

import { type Padding, resolveStyles, type variants } from '@/shared/lib/design';
import { cn } from '@/shared/lib/utils';

import { type Direction, type Justify, type SelectOption, useSelect } from '../model';
import { List } from './components';

interface SelectProps {
	options: SelectOption[];
	value: string;
	onChange: (value: string) => void;

	placeholder?: string;
	variant?: keyof typeof variants.select;
	padding?: Padding;
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
	padding = 'md',
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

	const alignments = {
		start: 'justify-start text-left',
		center: 'justify-center text-center',
		end: 'justify-end text-right',
	} as const;

	const handleSelect = (value: string) => {
		onChange(value);
		close();
	};

	const styles = resolveStyles({
		component: 'select',
		variant,
		padding,
		className: cn('group relative flex w-full items-center gap-2', alignments[align], className),
	});

	return (
		<div ref={wrapperRef} className="relative w-full">
			<button
				ref={buttonRef}
				aria-expanded={isOpen}
				aria-haspopup="listbox"
				aria-invalid={error || undefined}
				className={styles}
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
						'min-w-0',
						!selectedOption && 'text-(--text-secondary) transition-colors group-hover:text-(--text-primary)'
					)}
				>
					{selectedOption?.label ?? placeholder}
				</span>
				{!hideChevron && (
					<IconChevronDown
						className={cn(
							'absolute right-2 size-4 shrink-0 text-(--text-secondary) transition-[rotate,color] duration-200 ease-in-out',
							isOpen ? 'rotate-180 text-(--accent-primary)' : 'rotate-0'
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
					onSelect={handleSelect}
				/>
			)}
		</div>
	);
};
