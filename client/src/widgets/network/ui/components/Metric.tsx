import { cn } from '@/shared/lib/utils';

export const Metric = ({ label, value, style }: { label: string; value: string; style?: string }) => {
	return (
		<div className="flex flex-col items-center gap-1" title={value}>
			<span className="text-xs text-(--text-secondary)">{label}</span>
			<span className={cn('text-sm font-semibold text-(--text-primary) tabular-nums', style)}>{value}</span>
		</div>
	);
};
