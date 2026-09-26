import type { ReactNode } from 'react';

import { cn } from '@/shared/lib/utils';

interface ArticleSectionProps {
	id: string;
	title: string;
	children: ReactNode;
	number?: number;
	first?: boolean;
}

export const ArticleSection = ({ id, title, children, number, first = false }: ArticleSectionProps) => {
	return (
		<section>
			<h2
				className={cn(
					'text-lg font-bold tracking-tight md:text-xl',
					first ? 'scroll-mt-72' : 'scroll-mt-24 md:scroll-mt-32'
				)}
				id={id}
			>
				{number}. {title}
			</h2>
			<div className="print-content mt-3 leading-relaxed text-(--color-secondary)">{children}</div>
		</section>
	);
};
