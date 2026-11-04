import { type Icon, IconHistory } from '@tabler/icons-react';
import type { ReactNode } from 'react';

import { cn } from '@/shared/lib/utils';

interface NoContentProps {
	icon?: Icon;
	title: string;
	description?: string;
	className?: string;
	children?: ReactNode;
}

export const NoContent = ({ icon: Icon = IconHistory, title, description, className, children }: NoContentProps) => (
	<div className={cn('flex h-full flex-col items-center justify-center py-2 select-none', className)}>
		<div className="mb-1.5 flex size-8 items-center justify-center rounded-lg bg-(--tone) md:size-10">
			<Icon className="size-4.5 shrink-0 text-(--text-tertiary) md:size-5.5" />
		</div>
		<span className="text-sm text-(--text-secondary)">{title}</span>
		{description && <span className="trim mt-0.5 text-center text-xs text-(--text-disabled)">{description}</span>}
		{children && <div className="mt-3">{children}</div>}
	</div>
);
