import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { IconClock, IconGripHorizontal, IconServer, IconWorld } from '@tabler/icons-react';
import type { CSSProperties } from 'react';

import { cn } from '@/shared/lib/utils';
import { Button, Divider } from '@/shared/ui';

import { getCheckViaLabel, getResponseTimeClass } from '../../../lib';
import type { MonitoredService } from '../../../model';
import { StatusDot } from '..';

interface CardProps {
	service: MonitoredService;
	disabled?: boolean;
	onClick: () => void;
}

export const Card = ({ service, disabled = false, onClick }: CardProps) => {
	const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({
		id: service.id,
		disabled,
	});

	const style: CSSProperties = {
		transform: CSS.Transform.toString(transform),
		transition,
		zIndex: isDragging ? 10 : undefined,
		position: 'relative',
	};

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
		<div
			ref={setNodeRef}
			className={cn(
				'core-tone group/service relative flex min-h-17 shrink-0 items-stretch overflow-hidden rounded-lg border border-(--border-contrast)/15',
				isDragging && 'shadow-lg'
			)}
			style={style}
		>
			<Button
				ref={setActivatorNodeRef}
				aria-label="Изменить порядок сервиса"
				className="group/handle absolute -top-1 left-1/2 z-10 hidden h-3.5 w-10 -translate-x-1/2 cursor-grab items-center justify-center rounded-t-none rounded-b-md bg-(--tone-strong) opacity-0 transition-opacity group-hover/service:opacity-100 active:cursor-grabbing xl:flex"
				disabled={disabled}
				padding="none"
				type="button"
				variant="custom"
				{...attributes}
				{...listeners}
				centerIcon={
					<IconGripHorizontal className="size-4 text-(--text-secondary) group-hover/handle:text-(--accent-primary)" />
				}
			/>
			<Button className="min-w-0 flex-1 rounded-lg text-left" type="button" variant="custom" onClick={onClick}>
				<div className="flex min-w-0 flex-1 flex-col gap-1.5">
					<div className="flex items-center justify-between gap-2">
						<div className="flex max-w-2/3 min-w-0 items-center gap-1">
							<StatusDot disabled={!service.isActive} status={service.lastStatus} />
							<span className="truncate text-(--text-primary)">{service.name}</span>
						</div>
						{renderStatus()}
					</div>
					<div className="flex items-center justify-between gap-3 text-sm text-(--text-secondary)">
						<div className="flex max-w-2/3 min-w-0 items-center gap-1">
							<AddressIcon className="size-3.5 shrink-0" />
							<span className="mt-px truncate">{address}</span>
							<Divider
								className="my-auto hidden h-2.5 transition-opacity group-hover/service:opacity-100 lg:block xl:opacity-0"
								direction="Y"
								margX="xs"
							/>
							<span className="mt-px hidden text-xs transition-opacity group-hover/service:opacity-100 lg:block xl:opacity-0">
								{getCheckViaLabel(service.checkVia)}
							</span>
						</div>
						{lastCheckedAt && (
							<div
								className="flex shrink-0 items-center gap-1 tabular-nums transition-opacity group-hover/service:opacity-100 xl:opacity-0"
								title="Последняя проверка"
							>
								<IconClock className="size-3" />
								<span className="trim not-md:text-xs">{lastCheckedAt}</span>
							</div>
						)}
					</div>
				</div>
			</Button>
		</div>
	);
};
