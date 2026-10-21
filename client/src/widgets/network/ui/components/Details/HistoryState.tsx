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
		<div className="flex h-full min-h-0 flex-col items-center justify-center gap-2 text-center">
			<div className="flex flex-col items-center">
				<div className="mb-1.5 flex size-8 items-center justify-center rounded-lg bg-(--tone) md:size-10">
					<Icon
						className={cn(
							'size-4.5 shrink-0 text-(--text-disabled) md:size-5.5',
							loading && 'animate-spin text-(--accent-primary)'
						)}
					/>
				</div>
				<span className="text-sm text-(--text-secondary)">{title}</span>
				{desc && <span className="-mt-1 text-xs text-(--text-disabled)">{desc}</span>}
			</div>
		</div>
	);
};
