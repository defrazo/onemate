import type { ReactNode } from 'react';

import { cn } from '@/shared/lib/utils';

export const OverviewRow = ({ label, value }: { label: string; value?: ReactNode }) => {
	const isEmpty = value === undefined || value === null || value === '';

	return (
		<div className="flex min-w-0 flex-col gap-1 rounded-lg bg-white/[0.035] p-3 hover:bg-white/6">
			<span className="text-xs text-(--color-secondary) opacity-55">{label}</span>
			<span className={cn('truncate text-sm', isEmpty ? 'text-(--color-secondary) opacity-40' : 'font-medium')}>
				{isEmpty ? 'Не указано' : value}
			</span>
		</div>
	);
};
