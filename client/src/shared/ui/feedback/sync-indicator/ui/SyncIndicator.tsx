import { IconRefresh } from '@tabler/icons-react';

export const SyncIndicator = () => (
	<div
		aria-label="Синхронизация"
		className="pointer-events-auto absolute top-4.5 right-3 flex items-center justify-end bg-(--bg-secondary) 2xl:top-5.5 2xl:right-4"
		role="status"
	>
		<IconRefresh className="size-4 animate-spin text-(--text-disabled)" stroke={1.75} />
	</div>
);
