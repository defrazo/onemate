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
				'core-border absolute top-full left-0 z-10 -mt-2.5 max-h-[60vh] w-full overflow-y-auto !rounded-t-none bg-[var(--bg-primary)] pt-2.5 shadow-[inset_0_16px_6px_-4px_rgba(0,0,0,0.2)]',
				className
			)}
		>
			{items.map((item, index) => (
				<div
					key={index}
					className="cursor-pointer p-2 hover:bg-[var(--bg-accent-opacity)]"
					onMouseDown={() => (onSelect ? onSelect(item) : null)}
				>
					{renderItem(item)}
				</div>
			))}
		</div>
	);
};

export default SuggestionList;
