import type { Icon } from '@tabler/icons-react';

import { cn } from '@/shared/lib/utils';

import { BackButton } from '../../../primitives/button/ui/BackButton';

interface ViewHeaderProps {
	icon: Icon;
	title: string;
	backTitle?: string;
	className?: string;
	onBack: () => void;
}

export const ViewHeader = ({ icon: Icon, title, backTitle, className, onBack }: ViewHeaderProps) => (
	<div className={cn('flex min-w-0 shrink-0 items-center justify-between gap-2', className)}>
		<BackButton title={backTitle ?? 'Вернуться назад'} onClick={onBack} />
		<div className="flex h-8 min-w-0 items-center gap-1.5 rounded-md bg-(--accent-primary-muted) px-2 py-1 text-(--accent-primary) lg:h-6">
			<Icon className="size-5 shrink-0 xl:size-4" />
			<span className="trim text-sm">{title}</span>
		</div>
	</div>
);
