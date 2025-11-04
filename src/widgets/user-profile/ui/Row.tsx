import type { ReactNode } from 'react';

import { cn } from '@/shared/lib/utils';

interface RowProps {
	label: string;
	value: ReactNode;
	isColumn?: boolean;
}

export const Row = ({ label, value, isColumn = false }: RowProps) => (
	<div className="hover:bg-(--bg-tertiary)">
		<div className="mx-4 border-y border-(--border-color)">
			<dl className="grid grid-cols-2 py-2">
				<dt className="cursor-default text-(--color-secondary) opacity-70">{label}</dt>
				<dd className={cn('', isColumn && 'flex flex-col')}>{value}</dd>
			</dl>
		</div>
	</div>
);
