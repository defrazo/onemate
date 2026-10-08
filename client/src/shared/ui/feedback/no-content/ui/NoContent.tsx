import { type Icon, IconHistory } from '@tabler/icons-react';

import { cn } from '@/shared/lib/utils';

interface NoContentProps {
	icon?: Icon;
	title: string;
	description?: string;
	className?: string;
}

export const NoContent = ({ icon: Icon = IconHistory, title, description, className }: NoContentProps) => (
	<div className={cn('flex h-full flex-col items-center justify-center', className)}>
		<div className="mb-1.5 flex size-8 items-center justify-center rounded-lg bg-(--tone) md:size-10">
			<Icon className="size-4.5 shrink-0 text-(--text-disabled) md:size-5.5" />
		</div>
		<span className="text-sm text-(--text-secondary)">{title}</span>
		{description && <span className="trim text-xs text-(--text-disabled)">{description}</span>}
	</div>
);
