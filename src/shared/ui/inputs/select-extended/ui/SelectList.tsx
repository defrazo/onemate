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
				'core-base hide-scrollbar absolute right-0 z-30 -my-px max-h-48 w-full min-w-max overflow-y-auto rounded-xl border-solid border-(--accent-default-op) text-center',
				addStyle,
				openUpwards
					? `bottom-full border ${variant === 'embedded' && 'rounded-b-none border-b-0'}`
					: `top-full border ${variant === 'embedded' && 'rounded-t-none border-t-0'}`
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
						'flex w-full cursor-pointer items-center gap-2 p-2 text-sm whitespace-nowrap hover:bg-(--accent-hover) hover:text-(--accent-text)',
						justifies[justify],
						option.value === value && 'text-(--accent-hover)'
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
							alt=""
							className="no-touch-callout size-6 rounded-lg"
							decoding="async"
							loading="lazy"
							src={option.icon}
							onContextMenu={(e) => e.preventDefault()}
						/>
					)}
					<span className="font-bold">{option.label}</span>
					{visibleKey && <span>{option.key}</span>}
				</li>
			))}
		</ul>
	);
};
