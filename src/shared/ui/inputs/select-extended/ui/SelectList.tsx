import { cn } from '@/shared/lib/utils';
import type { Justify, SelectExtOption } from '../model';
import type { Dispatch, SetStateAction } from 'react';

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
				'core-base hide-scrollbar absolute right-0 z-30 -my-px max-h-48 w-full min-w-max overflow-y-auto rounded-xl border-solid border-[var(--accent-default-op)] text-center',
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
						'flex w-full cursor-pointer items-center gap-2 p-2 text-sm whitespace-nowrap hover:bg-[var(--accent-hover)] hover:text-[var(--color-primary)]',
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
			{options.map((opt) => (
				<li
					key={opt.value}
					aria-selected={opt.value === value}
					className={cn(
						'flex w-full cursor-pointer items-center gap-2 p-2 text-sm whitespace-nowrap hover:bg-[var(--accent-hover)] hover:text-[var(--accent-text)]',
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
					{opt.icon && (
						<img
							alt=""
							className="no-touch-callout size-6 rounded-lg"
							src={opt.icon}
							onContextMenu={(e) => e.preventDefault()}
						/>
					)}
					<span className="font-bold">{opt.label}</span>
					{visibleKey && <span>{opt.key}</span>}
				</li>
			))}
		</ul>
	);
};
