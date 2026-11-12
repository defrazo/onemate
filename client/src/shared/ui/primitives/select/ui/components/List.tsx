import { IconCheck } from '@tabler/icons-react';

import { cn } from '@/shared/lib/utils';

import type { Justify, SelectOption } from '../../model/types';

interface ListProps {
	id: string;
	options: SelectOption[];
	value: string;
	onSelect: (value: string) => void;

	align: Justify;
	clearable: boolean;

	className?: string;
}

const alignments: Record<Justify, string> = {
	start: 'justify-start',
	center: 'justify-center',
	end: 'justify-end',
};

export const List = ({ id, options, value, onSelect, align, clearable, className }: ListProps) => {
	return (
		<ul
			className={cn(
				'max-h-(--select-max-height) w-full scrollbar-none overflow-y-auto overscroll-contain rounded-xl border border-(--border-primary) bg-(--bg-secondary) p-1.5 shadow-(--shadow-contrast)',
				className
			)}
			id={id}
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
								'relative flex w-full min-w-0 cursor-pointer items-center gap-2 rounded-lg px-2.5 py-2 text-sm transition-colors hover:bg-(--tone-strong)',
								selected && 'bg-(--accent-primary-muted) text-(--accent-primary)',
								option.disabled && 'cursor-not-allowed opacity-40',
								alignments[align]
							)}
							disabled={option.disabled}
							type="button"
							onClick={() => onSelect(option.value)}
						>
							{option.icon &&
								(typeof option.icon === 'string' ? (
									<img alt="" className="size-5 shrink-0 rounded-md" src={option.icon} />
								) : (
									option.icon
								))}
							<span className="min-w-0 truncate font-semibold" title={option.label}>
								{option.label}
							</span>
							{option.key && (
								<span className="max-w-24 shrink-0 truncate text-xs text-(--text-disabled)">
									{option.key}
								</span>
							)}
							{selected && <IconCheck className="absolute right-2.5 size-4 shrink-0" />}
						</button>
					</li>
				);
			})}
		</ul>
	);
};
