import type { ReactNode } from 'react';

import { cn } from '@/shared/lib/utils';

interface SuggestionListProps<T> {
	items: T[];
	onSelect?: (item: T) => void;
	renderItem: (item: T) => ReactNode;
	className?: string;
}

const SuggestionList = <T,>({ items, onSelect, renderItem, className }: SuggestionListProps<T>) => {
	if (items.length === 0) return null;

	return (
		<div
			className={cn(
				'hide-scrollbar absolute top-full left-0 z-30 mt-1.5 max-h-72 w-full overflow-y-auto rounded-xl border border-solid border-(--border-color) bg-(--bg-secondary) p-1 shadow-[0_12px_32px_rgba(0,0,0,0.35)]',
				className
			)}
		>
			{items.map((item, idx) => (
				<div
					key={idx}
					className="cursor-pointer rounded-lg px-3 py-1 transition-colors hover:bg-white/6"
					onMouseDown={() => (onSelect ? onSelect(item) : null)}
				>
					{renderItem(item)}
				</div>
			))}
		</div>
	);
};

export default SuggestionList;
