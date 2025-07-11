import React, { useEffect, useRef, useState } from 'react';

import { IconDown } from '@/shared/assets/icons';
import { getComponentStyles, sizes, variants } from '@/shared/lib/ui-kit';
import { cn } from '@/shared/lib/utils';

interface SelectExtOption {
	key?: string;
	value: string;
	label: string;
	icon?: string;
	disabled?: boolean;
}

interface SelectExtProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
	options: SelectExtOption[];
	value: string;
	onChange: (value: string) => void;
	placeholder?: string;
	variant?: keyof typeof variants.selectExt;
	size?: keyof typeof sizes.selectExt;
	error?: boolean;
	justify?: 'start' | 'center' | 'end';
	visibleKey?: boolean;
	visibleDown?: boolean;
	disabled?: boolean;
}

const SelectExt = ({
	options,
	value,
	onChange,
	placeholder,
	variant = 'default',
	size = 'md',
	error = false,
	justify = 'start',
	visibleKey = true,
	visibleDown = true,
	disabled = false,
	className,
}: SelectExtProps) => {
	const [isOpen, setIsOpen] = useState(false);
	const selectedOption = options.find((opt) => opt.value === value);
	const buttonRef = useRef<HTMLButtonElement>(null);
	const wrapperRef = useRef<HTMLDivElement>(null);
	const [openUpwards, setOpenUpwards] = useState(false);

	const handleOpen = () => {
		if (isOpen) {
			setIsOpen(false);
			return;
		}

		if (!buttonRef.current) return;

		const rect = buttonRef.current.getBoundingClientRect();
		const spaceBelow = window.innerHeight - rect.bottom;
		const spaceAbove = rect.top;

		setOpenUpwards(spaceBelow < 200 && spaceAbove > spaceBelow);
		setIsOpen(true);
	};

	const styles = getComponentStyles({
		variant,
		size,
		error,
		disabled: disabled,
		component: 'selectExt',
	});

	const justifies = {
		start: 'justify-start',
		center: 'justify-center',
		end: 'justify-end',
	};

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) setIsOpen(false);
		};

		document.addEventListener('mousedown', handleClickOutside);
		return () => document.removeEventListener('mousedown', handleClickOutside);
	}, []);

	return (
		<div ref={wrapperRef} className="relative flex size-full">
			<button
				ref={buttonRef}
				aria-expanded={isOpen}
				aria-haspopup="listbox"
				className={cn(styles, className)}
				disabled={disabled}
				type="button"
				onClick={handleOpen}
			>
				{selectedOption?.icon && <img alt="" className="mr-2 size-6 rounded-xl" src={selectedOption.icon} />}
				<span
					className={cn(
						'w-full text-center',
						visibleDown && 'pr-6',
						!selectedOption && 'text-muted-foreground'
					)}
				>
					{selectedOption?.label ?? placeholder}
				</span>
				{/* <span className={cn('w-full pr-6 text-center', !selectedOption && 'text-muted-foreground')}>
					{selectedOption?.label ?? placeholder}
				</span> */}
				{visibleDown && (
					<div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2">
						<IconDown className="size-4" />
					</div>
				)}
			</button>
			{isOpen && !disabled && (
				<ul
					className={cn(
						'core-elements core-border absolute right-0 z-30 max-h-60 w-full min-w-max overflow-y-auto rounded-l-xl text-center',
						openUpwards ? 'bottom-full' : 'top-full'
					)}
					role="listbox"
					tabIndex={-1}
				>
					{options.map((opt) => (
						<li
							key={opt.value}
							aria-selected={opt.value === value}
							className={cn(
								'flex w-full cursor-pointer items-center gap-2 p-2 text-sm whitespace-nowrap hover:bg-[var(--accent-hover)] hover:text-[var(--color-primary)]',
								justifies[justify],
								opt.value === value && 'text-[var(--accent-hover)]'
							)}
							role="option"
							onClick={() => {
								if (opt.disabled) return;
								onChange(opt.value);
								setIsOpen(false);
							}}
						>
							{opt.icon && <img alt="" className="size-6 rounded-lg" src={opt.icon} />}
							<span className="font-bold">{opt.label}</span>
							{visibleKey && <span className="opacity-50">{opt.key}</span>}
						</li>
					))}
				</ul>
			)}
		</div>
	);
};

export default SelectExt;
