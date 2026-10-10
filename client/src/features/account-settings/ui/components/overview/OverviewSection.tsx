import type { Icon } from '@tabler/icons-react';
import type { ReactNode } from 'react';

interface OverviewSectionProps {
	title: string;
	icon: Icon;
	children: ReactNode;
}

export const OverviewSection = ({ title, icon: Icon, children }: OverviewSectionProps) => {
	return (
		<section className="core-surface-contrast core-gap flex flex-col bg-(--bg-secondary) p-3 shadow-(--shadow-contrast)">
			<div className="flex items-center gap-2">
				<div className="flex size-8 items-center justify-center rounded-md bg-(--accent-primary)/12">
					<Icon className="size-4.5 text-(--accent-primary)" />
				</div>
				<h2 className="text-lg font-semibold">{title}</h2>
			</div>
			<div className="grid grid-cols-2 gap-2">{children}</div>
		</section>
	);
};
