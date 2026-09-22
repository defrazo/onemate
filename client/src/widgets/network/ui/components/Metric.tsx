import { cn } from '@/shared/lib/utils';

export const Metric = ({ label, value, style }: { label: string; value: string; style?: string }) => {
	return (
		<div className="flex flex-col items-center gap-1">
			<span className="text-xs text-(--color-secondary)">{label}</span>
			<span className={cn('trim text-sm font-bold text-(--color-primary) tabular-nums', style)}>{value}</span>
		</div>
	);
};
