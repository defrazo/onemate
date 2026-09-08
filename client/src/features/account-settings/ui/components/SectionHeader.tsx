import type { Icon } from '@tabler/icons-react';

export const SectionHeader = ({ title, icon: Icon }: { title: string; icon: Icon }) => (
	<div className="flex items-center gap-2.5">
		<div className="flex size-8 items-center justify-center rounded-lg bg-(--accent-default)/12">
			<Icon className="size-4.5 text-(--accent-default)" />
		</div>
		<h2 className="core-header">{title}</h2>
	</div>
);
