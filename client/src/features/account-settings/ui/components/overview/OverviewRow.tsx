import type { ReactNode } from 'react';

import { cn } from '@/shared/lib/utils';

export const OverviewRow = ({ label, value }: { label: string; value?: ReactNode }) => {
	const isEmpty = value === undefined || value === null || value === '';

	return (
		<div className="core-tone flex min-w-0 flex-col gap-1 rounded-lg p-3">
			<span className="text-xs text-(--text-secondary) opacity-55">{label}</span>
			<span
				className={cn(
					'truncate text-sm text-(--text-primary)',
					isEmpty && 'text-(--text-secondary) opacity-40'
				)}
			>
				{isEmpty ? 'Не указано' : value}
			</span>
		</div>
	);
};
