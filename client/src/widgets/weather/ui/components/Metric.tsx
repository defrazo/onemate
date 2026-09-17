import type { Icon } from '@tabler/icons-react';

interface MetricProps {
	icon: Icon;
	label: string;
	value: string;
}

export const Metric = ({ icon: Icon, label, value }: MetricProps) => (
	<div className="flex items-center gap-2">
		<div className="flex size-10 items-center justify-center rounded-lg bg-(--accent-default)/8 text-(--accent-default)/80">
			<Icon />
		</div>
		<div className="flex flex-col">
			<span className="text-xs text-(--color-secondary)">{label}</span>
			<span className="text-sm font-bold">{value}</span>
		</div>
	</div>
);
