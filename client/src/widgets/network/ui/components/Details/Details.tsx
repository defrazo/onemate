import { useEffect, useState } from 'react';
import { IconReload, IconReport, IconServer, IconSettings, IconWorld } from '@tabler/icons-react';

import { useStore } from '@/app/providers';
import { cn } from '@/shared/lib/utils';
import { Button } from '@/shared/ui';

import { getResponseTimeClass, getStatusCodeClass } from '../../../lib';
import type { MonitoredService, MonitoringHistory } from '../../../model';
import { Metric, StatusDot, ViewHeader } from '..';
import { History } from '.';

interface DetailsProps {
	service: MonitoredService;
	onBack: () => void;
	onSettings: () => void;
}

export const Details = ({ service, onBack, onSettings }: DetailsProps) => {
	const { networkStore, notifyStore } = useStore();

	const [isChecking, setIsChecking] = useState(false);

	const [history, setHistory] = useState<MonitoringHistory | null>(null);
	const [isHistoryLoading, setIsHistoryLoading] = useState(true);
	const [isHistoryError, setIsHistoryError] = useState(false);

	const statusLabel =
		service.lastStatus === 'up' ? 'Работает' : service.lastStatus === 'down' ? 'Недоступен' : 'Не проверялся';

	const lastChecked = service.lastCheckedAt
		? new Date(service.lastCheckedAt).toLocaleString('ru-RU', {
				day: '2-digit',
				month: '2-digit',
				hour: '2-digit',
				minute: '2-digit',
			})
		: '–';

	const address = service.type === 'http' ? service.url : `${service.host}`;

	const fetchHistory = async (): Promise<void> => {
		try {
			const history = await networkStore.loadHistory(service.id);

			setHistory(history);
			setIsHistoryError(false);
		} catch {
			setIsHistoryError(true);
		}
	};

	const checkMonitoredService = async () => {
		if (isChecking) return;

		setIsChecking(true);

		try {
			await networkStore.checkMonitoredService(service.id);
			await fetchHistory();
		} catch {
			notifyStore.setNotice('Не удалось выполнить проверку', 'error');
		} finally {
			setIsChecking(false);
		}
	};

	useEffect(() => {
		let active = true;

		setIsHistoryLoading(true);

		networkStore
			.loadHistory(service.id)
			.then((history) => {
				if (!active) return;

				setHistory(history);
				setIsHistoryError(false);
			})
			.catch(() => {
				if (active) setIsHistoryError(true);
			})
			.finally(() => {
				if (active) setIsHistoryLoading(false);
			});

		return () => {
			active = false;
		};
	}, [service.id, networkStore]);

	return (
		<div className="core-gap flex h-full min-h-0 flex-col">
			<ViewHeader icon={IconReport} title="Мониторинг сервиса" onBack={onBack} />
			<div className="flex justify-between">
				<div className="flex flex-col">
					<div className="flex items-center gap-0.5">
						<StatusDot disabled={!service.isActive} status={service.lastStatus} />
						<span className="mr-1 max-w-32 truncate text-base font-bold lg:max-w-44 lg:text-lg">
							{service.name}
						</span>
						<Button
							centerIcon={<IconSettings className="size-4.5" />}
							padding="none"
							title="Настройки мониторинга"
							variant="icon"
							onClick={onSettings}
						/>
					</div>
					{service.type === 'http' ? (
						<div className="flex items-center gap-1 text-(--text-secondary)">
							<IconWorld className="size-3 shrink-0" />
							<a
								className="mt-px block max-w-32 min-w-0 cursor-pointer truncate text-xs text-(--text-secondary) hover:text-(--accent-primary) lg:max-w-44 lg:text-sm xl:max-w-64"
								href={service.url}
								rel="noopener noreferrer"
								target="_blank"
							>
								{service.url}
							</a>
						</div>
					) : (
						<div className="flex items-center gap-1 text-(--text-secondary)">
							<IconServer className="size-3 shrink-0" />
							<span className="mt-px max-w-32 truncate font-mono text-xs text-(--text-secondary) lg:max-w-44 lg:text-sm xl:max-w-64">
								{address}
							</span>
						</div>
					)}
				</div>
				<div className="mt-1 flex flex-col gap-1 text-(--text-secondary)">
					<span className="text-xs">Последняя проверка:</span>
					<div className="mx-auto flex items-center gap-1.5">
						<span className="trim text-xs tabular-nums xl:text-sm">{lastChecked}</span>
						<Button
							centerIcon={<IconReload className={cn('size-4', isChecking && 'animate-spin')} />}
							disabled={isChecking}
							padding="none"
							title="Проверить сейчас"
							variant="icon"
							onClick={checkMonitoredService}
						/>
					</div>
				</div>
			</div>
			<div className="my-auto grid grid-cols-3 rounded-lg bg-(--tone-strong) py-2.5 xl:my-3">
				<Metric
					label="Отклик"
					style={getResponseTimeClass(service.lastResponseTime)}
					value={service.lastResponseTime !== null ? `${service.lastResponseTime} мс` : '–'}
				/>
				{service.type === 'http' ? (
					<Metric
						label="HTTP"
						style={getStatusCodeClass(service.lastStatusCode)}
						value={service.lastStatusCode !== null ? String(service.lastStatusCode) : '–'}
					/>
				) : (
					<Metric
						label="Порт"
						style={
							service.lastStatus === 'up'
								? 'text-(--status-success)'
								: service.lastStatus === 'down'
									? 'text-(--status-error)'
									: undefined
						}
						value={String(service.port)}
					/>
				)}
				<Metric
					label="Статус"
					style={
						service.lastStatus === 'up'
							? 'text-(--status-success)'
							: service.lastStatus === 'down'
								? 'text-(--status-error)'
								: undefined
					}
					value={statusLabel}
				/>
			</div>
			<History
				history={history}
				isActive={service.isActive}
				isError={isHistoryError}
				isLoading={isHistoryLoading}
			/>
		</div>
	);
};
