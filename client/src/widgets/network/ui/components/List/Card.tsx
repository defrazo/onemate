import { IconClock, IconServer, IconWorld } from '@tabler/icons-react';

import { cn } from '@/shared/lib/utils';
import { Button } from '@/shared/ui';

import { getResponseTimeClass } from '../../../lib';
import type { MonitoredService } from '../../../model';
import { StatusDot } from '..';

export const Card = ({ service, onClick }: { service: MonitoredService; onClick: () => void }) => {
	const lastCheckedAt = service.lastCheckedAt
		? new Date(service.lastCheckedAt).toLocaleString('ru-RU', {
				day: '2-digit',
				month: '2-digit',
				hour: '2-digit',
				minute: '2-digit',
			})
		: null;

	const renderStatus = () => {
		if (!service.isActive) return <span className="text-sm text-(--text-disabled)">Отключено</span>;
		if (service.lastStatus === null) return <span className="text-sm text-(--text-disabled)">Ожидает</span>;
		if (service.lastStatus === 'down') return <span className="text-sm text-(--status-error)">Недоступен</span>;

		if (service.lastResponseTime !== null) {
			return (
				<span className={cn('shrink-0 text-sm tabular-nums', getResponseTimeClass(service.lastResponseTime))}>
					{service.lastResponseTime} мс
				</span>
			);
		}

		return <span className="text-(--text-disabled)">–</span>;
	};

	const address = service.type === 'http' ? service.url : `${service.host}:${service.port}`;
	const AddressIcon = service.type === 'http' ? IconWorld : IconServer;

	return (
		<Button className="core-tone min-h-17 snap-start xl:min-h-17" type="button" variant="custom" onClick={onClick}>
			<div className="flex min-w-0 flex-1 flex-col gap-1.5">
				<div className="flex items-center justify-between">
					<div className="flex max-w-2/3 min-w-0 items-center gap-1">
						<StatusDot disabled={!service.isActive} status={service.lastStatus} />
						<span className="truncate text-(--text-primary)">{service.name}</span>
					</div>
					{renderStatus()}
				</div>
				<div className="flex items-center justify-between text-sm text-(--text-secondary)">
					<div className="flex max-w-2/3 min-w-0 items-center gap-1">
						<AddressIcon className="size-3.5 shrink-0" />
						<span className="mt-px truncate">{address}</span>
					</div>
					{lastCheckedAt && (
						<div
							className="flex shrink-0 items-center gap-1 tabular-nums transition-opacity group-hover:opacity-100 xl:opacity-0"
							title="Последняя проверка"
						>
							<IconClock className="size-3" />
							<span className="trim font-mono">{lastCheckedAt}</span>
						</div>
					)}
				</div>
			</div>
		</Button>
	);
};
