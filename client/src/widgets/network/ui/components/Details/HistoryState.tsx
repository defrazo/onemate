import type { Icon } from '@tabler/icons-react';

import { cn } from '@/shared/lib/utils';

interface HistoryStateProps {
	icon: Icon;
	title: string;
	desc?: string;
	loading?: boolean;
}

export const HistoryState = ({ icon: Icon, title, desc, loading }: HistoryStateProps) => {
	return (
		<div className="flex min-h-0 flex-1 items-center justify-center">
			<div className="flex flex-col items-center gap-0.5">
				<div className="mb-1 flex size-10 items-center justify-center rounded-xl bg-white/3">
					<Icon className={cn('size-5 text-(--accent-default)', loading && 'animate-spin')} />
				</div>
				<span className="text-sm text-(--color-secondary)">{title}</span>
				{desc && <span className="trim text-xs text-(--color-disabled)">{desc}</span>}
			</div>
		</div>
	);
};
