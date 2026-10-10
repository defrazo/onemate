import type { Icon } from '@tabler/icons-react';

interface MetricProps {
	icon: Icon;
	label: string;
	value: string;
}

export const Metric = ({ icon: Icon, label, value }: MetricProps) => (
	<div className="flex flex-row items-center gap-2 pl-5.5 lg:pl-0">
		<div className="flex size-8 items-center justify-center rounded-lg bg-(--accent-primary)/8 text-(--accent-primary)/80 lg:size-10">
			<Icon className="size-5 lg:size-6" />
		</div>
		<div className="flex flex-col items-start lg:gap-0">
			<span className="text-xs text-(--text-secondary)">{label}</span>
			<span className="text-sm font-semibold">{value}</span>
		</div>
	</div>
);
