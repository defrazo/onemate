import type { ReactNode } from 'react';

import { cn } from '@/shared/lib/utils';

interface CollapseProps {
	open: boolean;
	children: ReactNode;
	className?: string;
}

export const Collapse = ({ open, children, className }: CollapseProps) => (
	<div
		className={cn(
			'grid transition-[grid-template-rows,opacity] duration-300 ease-out',
			open ? 'grid-rows-[1fr] opacity-100' : 'pointer-events-none grid-rows-[0fr] opacity-0',
			className
		)}
	>
		<div className="overflow-hidden">{children}</div>
	</div>
);
