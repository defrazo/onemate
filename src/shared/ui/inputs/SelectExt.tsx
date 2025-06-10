import React, { useEffect, useRef, useState } from 'react';

import { IconDown } from '@/shared/assets/icons';
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
	placeholder: string;
	variant?: 'default' | 'ghost' | 'custom';
	size?: 'sm' | 'md' | 'lg';
	value: string;
	justify?: 'start' | 'center' | 'end';
	disabled?: boolean;
	onChange: (value: string) => void;
}

const SelectExt = ({
	options,
	justify = 'start',
	placeholder,
	variant = 'default',
	value,
	onChange,
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

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
				setIsOpen(false);
			}
		};

		document.addEventListener('mousedown', handleClickOutside);
		return () => document.removeEventListener('mousedown', handleClickOutside);
	}, []);

	const base = cn(
		'flex w-full ring-[var(--accent-hover)]',
		'transition-colors outline-none ring-inset',
		'focus:outline-none',
		'cursor-pointer appearance-none rounded-xl text-nowrap items-center p-2'
	);

	const variants = {
		default: cn('bg-[var(--bg-tertiary)]', ' focus:ring-1'),
		ghost: cn('border-[var(--border-color)] bg-transparent', 'hover:border-[var(--accent-hover)]', 'border-1'),
		custom: '',
	};

	const justifies = {
		start: 'justify-start',
		center: 'justify-center',
		end: 'justify-end',
	};

	return (
		<div ref={wrapperRef} className="relative flex size-full">
			<button
				ref={buttonRef}
				aria-expanded={isOpen}
				aria-haspopup="listbox"
				className={cn(base, variants[variant], className)}
				type="button"
				onClick={handleOpen}
			>
				{selectedOption?.icon && <img alt="" className="mr-2 size-6 rounded-xl" src={selectedOption.icon} />}
				<span className={cn('w-full pr-6 text-center', !selectedOption && 'text-muted-foreground')}>
					{selectedOption?.label ?? placeholder}
				</span>
				<div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2">
					<IconDown className="size-4" />
				</div>
			</button>
			{isOpen && !disabled && (
				<ul
					className={cn(
						'core-elements core-border absolute right-0 z-10 max-h-60 w-full min-w-max overflow-y-auto rounded-l-xl text-center',
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
								'flex w-full cursor-pointer items-center gap-2 p-2 text-sm text-nowrap hover:bg-[var(--accent-hover)] hover:text-[var(--color-primary)]',
								justify && justifies[justify],
								opt.value === value && 'font-bold text-[var(--accent-hover)]'
							)}
							role="option"
							onClick={() => {
								onChange(opt.value);
								setIsOpen(false);
							}}
						>
							{opt.icon && <img alt="" className="size-6 rounded-lg" src={opt.icon} />}
							<span className="font-bold">{opt.label}</span>
							<span className="opacity-50">{opt.key}</span>
						</li>
					))}
				</ul>
			)}
		</div>
	);
};

export default SelectExt;
