import type { ReactNode } from 'react';

import { cn } from '@/shared/lib/utils';
import { Divider } from '@/shared/ui';

interface ArticleSectionProps {
	id: string;
	title: string;
	children: ReactNode;
	first?: boolean;
}

const ArticleSection = ({ id, title, children, first = false }: ArticleSectionProps) => {
	return (
		<>
			<Divider />
			<section aria-labelledby={id}>
				<h2
					className={cn(
						'text-lg font-semibold md:text-xl',
						first ? 'scroll-mt-72' : 'scroll-mt-24 md:scroll-mt-32'
					)}
					id={id}
				>
					{title}
				</h2>
				<div className="mt-2">{children}</div>
			</section>
		</>
	);
};

export default ArticleSection;
