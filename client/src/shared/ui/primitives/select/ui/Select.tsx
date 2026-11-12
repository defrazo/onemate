import { useId } from 'react';
import { FloatingPortal } from '@floating-ui/react';
import { IconChevronDown } from '@tabler/icons-react';

import { type Padding, resolveStyles, type variants } from '@/shared/lib/design';
import { cn } from '@/shared/lib/utils';

import type { Direction, Justify, ListPlacement, SelectOption } from '../model/types';
import { useSelect } from '../model/useSelect';
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

	listWidth?: number;
	listPlacement?: ListPlacement;

	hideChevron?: boolean;
	clearable?: boolean;
	disabled?: boolean;
	error?: boolean;

	className?: string;
	listClassName?: string;
}

const alignments: Record<Justify, string> = {
	start: 'justify-start text-left',
	center: 'justify-center text-center',
	end: 'justify-end text-right',
};

export const Select = ({
	options,
	value,
	onChange,

	placeholder = 'Выберите значение',
	variant = 'default',
	padding = 'md',
	direction = 'auto',
	align = 'center',

	listWidth,
	listPlacement = 'start',

	hideChevron = false,
	clearable = false,
	disabled = false,
	error = false,

	className,
	listClassName,
}: SelectProps) => {
	const listId = useId();

	const { isOpen, refs, floatingStyles, getReferenceProps, getFloatingProps, close, toggle } = useSelect(
		direction,
		listPlacement,
		listWidth
	);

	const selectedOption = options.find((option) => option.value === value);

	const handleSelect = (nextValue: string): void => {
		onChange(nextValue);
		close();
	};

	const styles = resolveStyles({
		component: 'select',
		variant,
		padding,
		className: cn('relative flex w-full items-center gap-2', alignments[align], className),
	});

	return (
		<div className="relative w-full">
			<button
				ref={refs.setReference}
				{...getReferenceProps({
					'aria-controls': isOpen ? listId : undefined,
					'aria-expanded': isOpen,
					'aria-haspopup': 'listbox',
					'aria-invalid': error || undefined,
					onClick: toggle,
				})}
				className={styles}
				disabled={disabled}
				type="button"
			>
				{selectedOption?.icon &&
					(typeof selectedOption.icon === 'string' ? (
						<img alt="" className="size-5 shrink-0 rounded-md" src={selectedOption.icon} />
					) : (
						selectedOption.icon
					))}
				<span className="min-w-0 truncate">{selectedOption?.label ?? placeholder}</span>
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
				<FloatingPortal>
					<div ref={refs.setFloating} style={floatingStyles} {...getFloatingProps()} className="z-70">
						<List
							align={align}
							className={listClassName}
							clearable={clearable}
							id={listId}
							options={options}
							value={value}
							onSelect={handleSelect}
						/>
					</div>
				</FloatingPortal>
			)}
		</div>
	);
};
