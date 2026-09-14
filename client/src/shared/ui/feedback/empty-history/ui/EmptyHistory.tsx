import { IconHistory } from '@tabler/icons-react';

import { cn } from '@/shared/lib/utils';

interface EmptyHistoryProps {
	title?: string;
	description?: string;
	className?: string;
}

export const EmptyHistory = ({ title = 'История пуста', description, className }: EmptyHistoryProps) => (
	<div className={cn('flex h-full flex-col items-center justify-center gap-1', className)}>
		<IconHistory className="size-7 opacity-20" />
		<span className="text-sm text-(--color-secondary)">{title}</span>
		{description && <span className="trim text-xs text-(--color-disabled)">{description}</span>}
	</div>
);
