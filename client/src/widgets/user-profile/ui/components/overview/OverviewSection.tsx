import type { ReactNode } from 'react';
import type { Icon } from '@tabler/icons-react';

interface OverviewSectionProps {
	title: string;
	icon: Icon;
	children: ReactNode;
}

export const OverviewSection = ({ title, icon: Icon, children }: OverviewSectionProps) => {
	return (
		<section className="core-base core-card flex flex-col gap-4 shadow-(--shadow)">
			<div className="flex items-center gap-2">
				<div className="flex size-8 items-center justify-center rounded-lg bg-(--accent-default)/12">
					<Icon className="size-4.5 text-(--accent-default)" />
				</div>
				<h2 className="text-lg font-semibold">{title}</h2>
			</div>
			<div className="grid grid-cols-2 gap-2">{children}</div>
		</section>
	);
};
