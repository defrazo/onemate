import type { ReactNode } from 'react';

import { cn } from '@/shared/lib/utils';

interface ArticleSectionProps {
	id: string;
	title: string;
	children: ReactNode;
	number?: number;
	first?: boolean;
	className?: string;
}

export const ArticleSection = ({ id, title, children, number, first = false, className }: ArticleSectionProps) => {
	return (
		<section>
			<h2
				className={cn(
					'text-lg font-semibold tracking-tight md:text-xl',
					first ? 'scroll-mt-72' : 'scroll-mt-24 md:scroll-mt-32'
				)}
				id={id}
			>
				{number}. {title}
			</h2>
			<div className={cn('print-content mt-3 leading-relaxed text-(--text-secondary)', className)}>
				{children}
			</div>
		</section>
	);
};
