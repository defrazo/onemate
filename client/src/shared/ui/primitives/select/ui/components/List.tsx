import { IconCheck } from '@tabler/icons-react';

import { cn } from '@/shared/lib/utils';

import type { Justify, SelectOption } from '../../model';

interface ListProps {
	options: SelectOption[];
	value: string;
	onSelect: (value: string) => void;

	openUpwards: boolean;
	align: Justify;
	clearable: boolean;

	className?: string;
}

const alignments: Record<Justify, string> = {
	start: 'justify-start',
	center: 'justify-center',
	end: 'justify-end',
};

export const List = ({ options, value, onSelect, openUpwards, align, clearable, className }: ListProps) => {
	return (
		<ul
			className={cn(
				'absolute right-0 left-0 z-30 max-h-56 scrollbar-none overflow-y-auto rounded-xl border border-(--border-primary) bg-(--bg-secondary) p-1.5 shadow-(--shadow-contrast)',
				openUpwards ? 'bottom-full mb-1' : 'top-full mt-1',
				className
			)}
			role="listbox"
		>
			{clearable && value && (
				<li role="option">
					<button
						className={cn(
							'flex w-full cursor-pointer items-center gap-2 rounded-lg px-2.5 py-2 text-sm text-(--text-secondary) transition-colors hover:bg-(--tone-strong) hover:text-(--text-primary)',
							alignments[align]
						)}
						type="button"
						onClick={() => onSelect('')}
					>
						Сбросить
					</button>
				</li>
			)}
			{options.map((option) => {
				const selected = option.value === value;

				return (
					<li key={option.value} aria-selected={selected} className="not-last:mb-0.5" role="option">
						<button
							className={cn(
								'relative flex w-full cursor-pointer items-center gap-2 rounded-lg px-2.5 py-2 text-sm transition-colors hover:bg-(--tone-strong)',
								selected && 'bg-(--accent-primary-muted) text-(--accent-primary)',
								option.disabled && 'cursor-not-allowed opacity-40',
								alignments[align]
							)}
							disabled={option.disabled}
							type="button"
							onClick={() => onSelect(option.value)}
						>
							{option.icon && (
								<img
									alt=""
									className="size-5 rounded-md"
									decoding="async"
									loading="lazy"
									src={option.icon}
								/>
							)}
							<span className="font-semibold">{option.label}</span>
							{option.key && (
								<span className="truncate text-xs text-(--text-disabled)">{option.key}</span>
							)}
							{selected && <IconCheck className="absolute right-2 size-4" />}
						</button>
					</li>
				);
			})}
		</ul>
	);
};
