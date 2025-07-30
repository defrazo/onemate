import { cn } from '@/shared/lib/utils';

interface RowProps {
	label: string;
	value: React.ReactNode;
	isColumn?: boolean;
}

export const Row = ({ label, value, isColumn = false }: RowProps) => (
	<div className="hover:bg-[var(--bg-tertiary)]">
		<div className="mx-4 border-y border-[var(--border-color)]">
			<dl className="grid grid-cols-2 py-2">
				<dt className="cursor-default font-semibold">{label}</dt>
				<dd className={cn('text-[var(--accent-default)]', isColumn && 'flex flex-col')}>{value}</dd>
			</dl>
		</div>
	</div>
);
