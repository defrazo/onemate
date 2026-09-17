import type { Dispatch, SetStateAction } from 'react';

import { cn } from '@/shared/lib/utils';

import type { Justify, SelectExtOption } from '../model';

interface SelectListProps {
	options: SelectExtOption[];
	value: string;
	onChange: (value: string) => void;
	setIsOpen: Dispatch<SetStateAction<boolean>>;
	variant: string;
	openUpwards: boolean;
	justify: Justify;
	nullable: boolean;
	visibleKey: boolean;
	addStyle: string;
}

export const SelectList = ({
	options,
	value,
	onChange,
	setIsOpen,
	variant,
	openUpwards,
	justify,
	nullable,
	visibleKey,
	addStyle,
}: SelectListProps) => {
	const justifies = {
		start: 'justify-start',
		center: 'justify-center',
		end: 'justify-end',
	};

	return (
		<ul
			className={cn(
				'core-base hide-scrollbar core-border absolute right-1 z-30 max-h-48 w-full min-w-max overflow-y-auto p-1 text-center',
				addStyle,
				openUpwards
					? `bottom-full ${variant === 'embedded' && 'rounded-b-none border-b-0'}`
					: `top-full ${variant === 'embedded' && 'rounded-t-none border-t-0'}`
			)}
			role="listbox"
			tabIndex={-1}
		>
			{nullable && (
				<li
					aria-selected={value === ''}
					className={cn(
						'flex w-full cursor-pointer items-center gap-2 p-2 text-sm whitespace-nowrap hover:bg-(--accent-hover) hover:text-(--color-primary)',
						justifies[justify],
						value === '' && 'opacity-70'
					)}
					role="option"
					onClick={() => {
						onChange('');
						setIsOpen(false);
					}}
				>
					<span className="font-bold">Отменить выбор</span>
				</li>
			)}
			{options.map((option) => (
				<li
					key={option.value}
					aria-selected={option.value === value}
					className={cn(
						'flex w-full cursor-pointer items-center gap-2 rounded-lg px-3 py-1 text-sm whitespace-nowrap transition-colors hover:bg-white/6 hover:text-(--accent-text)',
						justifies[justify],
						option.value === value && 'text-(--accent-default)'
					)}
					role="option"
					onClick={() => {
						if (option.disabled) return;
						onChange(option.value);
						setIsOpen(false);
					}}
				>
					{option.icon && (
						<img
							className="no-touch-callout size-6 rounded-lg"
							decoding="async"
							loading="lazy"
							src={option.icon}
						/>
					)}
					<span className="font-bold">{option.label}</span>
					{visibleKey && <span>{option.key}</span>}
				</li>
			))}
		</ul>
	);
};
