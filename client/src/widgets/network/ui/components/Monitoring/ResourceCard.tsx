import { IconClock, IconPointFilled, IconWorld } from '@tabler/icons-react';

import { cn } from '@/shared/lib/utils';

import type { MonitoredService } from '../../../model';

interface ResourceCardProps {
	resource: MonitoredService;
	onClick: () => void;
}

export const ResourceCard = ({ resource, onClick }: ResourceCardProps) => {
	const statusLabel = !resource.isActive
		? 'Мониторинг выключен'
		: resource.lastCheckedAt
			? new Date(resource.lastCheckedAt).toLocaleString('ru-RU', {
					day: '2-digit',
					month: '2-digit',
					hour: '2-digit',
					minute: '2-digit',
				})
			: 'Не проверялся';

	return (
		<button
			className="core-border group/network-resource flex min-h-16 shrink-0 cursor-pointer items-center bg-(--bg-secondary) px-3 py-2 text-left transition hover:bg-white/3"
			type="button"
			onClick={onClick}
		>
			<div className="flex min-w-0 flex-1 flex-col gap-2">
				<div className="flex items-center justify-between gap-3">
					<div className="flex min-w-0 items-center gap-1">
						<IconPointFilled
							className={cn(
								'size-3',
								!resource.isActive && 'text-(--color-disabled)',
								resource.isActive &&
									resource.lastStatus === 'up' &&
									'animate-pulse text-(--status-success)',
								resource.isActive &&
									resource.lastStatus === 'down' &&
									'animate-pulse text-(--status-error)',
								resource.isActive && resource.lastStatus === null && 'text-(--color-disabled)'
							)}
						/>

						<span className="truncate text-(--color-primary)">{resource.name}</span>
					</div>

					{resource.isActive && resource.lastResponseTime !== null && (
						<span className="shrink-0 text-sm text-(--color-primary) tabular-nums">
							{resource.lastResponseTime} мс
						</span>
					)}
				</div>

				<div className="flex items-center justify-between gap-3 text-sm text-(--color-disabled)">
					<div className="flex min-w-0 items-center gap-1">
						<IconWorld className="size-3 shrink-0" />

						<span className="truncate">{resource.url}</span>
					</div>

					<div className="flex shrink-0 items-center gap-1">
						{resource.isActive && <IconClock className="size-3" />}

						<span>{statusLabel}</span>
					</div>
				</div>
			</div>
		</button>
	);
};
