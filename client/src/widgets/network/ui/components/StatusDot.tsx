import { IconPointFilled } from '@tabler/icons-react';

import { cn } from '@/shared/lib/utils';

export const StatusDot = ({ status, disabled = false }: { status: 'up' | 'down' | null; disabled?: boolean }) => {
	return (
		<IconPointFilled
			className={cn(
				'size-3',
				(disabled || status === null) && 'text-(--color-disabled)',
				!disabled && status === 'up' && 'animate-pulse text-(--status-success)',
				!disabled && status === 'down' && 'text-(--warning-default)/80'
			)}
		/>
	);
};
