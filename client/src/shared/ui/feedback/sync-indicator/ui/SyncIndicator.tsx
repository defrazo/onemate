import { IconRefresh } from '@tabler/icons-react';

import { cn } from '@/shared/lib/utils';

export const SyncIndicator = ({ className }: { className?: string }) => (
	<div
		aria-label="Синхронизация"
		className={cn(
			'pointer-events-auto absolute top-4.5 right-3 flex items-center justify-end bg-(--bg-secondary) 2xl:top-5.5 2xl:right-4',
			className
		)}
		role="status"
	>
		<IconRefresh className="size-4 animate-spin text-(--text-disabled)" stroke={1.75} />
	</div>
);
