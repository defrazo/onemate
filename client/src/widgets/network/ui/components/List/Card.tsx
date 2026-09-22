import { IconClock, IconPower, IconWorld } from '@tabler/icons-react';

import { cn } from '@/shared/lib/utils';
import { Button } from '@/shared/ui';

import { getResponseTimeClass } from '../../../lib';
import type { MonitoredService } from '../../../model';
import { StatusDot } from '..';

export const Card = ({ service, onClick }: { service: MonitoredService; onClick: () => void }) => {
	const statusLabel = !service.isActive
		? 'Отключено'
		: service.lastCheckedAt
			? new Date(service.lastCheckedAt).toLocaleString('ru-RU', {
					day: '2-digit',
					month: '2-digit',
					hour: '2-digit',
					minute: '2-digit',
				})
			: 'Ожидает';

	return (
		<Button
			className="min-h-16 rounded-xl bg-white/3 px-3 hover:bg-white/6"
			size="custom"
			type="button"
			variant="custom"
			onClick={onClick}
		>
			<div className="flex min-w-0 flex-1 flex-col gap-1.5">
				<div className="flex items-center justify-between">
					<div className="flex min-w-0 items-center gap-1">
						<StatusDot disabled={!service.isActive} status={service.lastStatus} />
						<span className="truncate text-(--color-primary)">{service.name}</span>
					</div>
					{service.isActive && service.lastResponseTime !== null && (
						<span
							className={cn(
								'shrink-0 text-sm font-bold tabular-nums',
								getResponseTimeClass(service.lastResponseTime)
							)}
						>
							{service.lastResponseTime} мс
						</span>
					)}
				</div>
				<div className="flex items-center justify-between text-sm text-(--color-secondary)">
					<div className="flex min-w-0 items-center gap-1">
						<IconWorld className="size-3.5 shrink-0" />
						<span className="truncate">{service.url}</span>
					</div>
					<div
						className={cn(
							'flex shrink-0 items-center gap-1 tabular-nums',
							service.isActive
								? service.lastCheckedAt
									? 'text-(--color-secondary)'
									: 'text-(--color-disabled)'
								: 'text-(--warning-default)/80'
						)}
					>
						{service.isActive ? <IconClock className="size-3" /> : <IconPower className="size-3" />}
						<span className="trim">{statusLabel}</span>
					</div>
				</div>
			</div>
		</Button>
	);
};
