import type { Icon } from '@tabler/icons-react';

interface MetricProps {
	icon: Icon;
	label: string;
	value: string;
}

export const Metric = ({ icon: Icon, label, value }: MetricProps) => (
	<div className="flex items-center gap-2">
		<div className="flex size-6 items-center justify-center rounded-lg bg-(--accent-default)/8 text-(--accent-default)/80 xl:size-10">
			<Icon className="size-4 xl:size-6" />
		</div>
		<div className="flex flex-row items-center xl:flex-col xl:items-start xl:gap-0">
			<span className="text-xs text-(--color-secondary)">{label}</span>
			<span className="mr-1 text-xs text-(--color-secondary) xl:hidden">:</span>
			<span className="text-sm font-bold">{value}</span>
		</div>
	</div>
);
