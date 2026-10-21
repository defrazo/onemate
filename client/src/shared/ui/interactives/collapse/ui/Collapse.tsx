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
			open
				? 'grid-rows-[1fr] opacity-100 delay-[0ms,100ms]'
				: 'pointer-events-none grid-rows-[0fr] opacity-0 delay-[0ms,0ms]',
			className
		)}
	>
		<div className={cn('min-h-0', open ? 'overflow-visible' : 'overflow-hidden')}>{children}</div>
	</div>
);
