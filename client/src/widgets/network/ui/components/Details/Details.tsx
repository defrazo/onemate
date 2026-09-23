import { useEffect, useState } from 'react';
import { IconReload, IconReport, IconSettings } from '@tabler/icons-react';

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
		setIsHistoryLoading(true);
		void fetchHistory().finally(() => setIsHistoryLoading(false));
	}, [service.id]);

	return (
		<div className="flex h-full min-h-0 flex-col gap-3">
			<ViewHeader icon={IconReport} title="Мониторинг сервиса" onBack={onBack} />
			<div className="flex justify-between">
				<div className="flex flex-col gap-1">
					<div className="flex items-center gap-0.5">
						<StatusDot disabled={!service.isActive} status={service.lastStatus} />
						<span className="trim text-lg font-bold">{service.name}</span>
						<Button
							centerIcon={
								<IconSettings className="size-4 text-(--color-secondary) hover:text-(--accent-default)" />
							}
							className="size-5 rounded-lg hover:bg-(--accent-default)/10"
							size="custom"
							title="Настройки мониторинга"
							variant="mobile"
							onClick={onSettings}
						/>
					</div>
					{service.type === 'http' ? (
						<a
							className="block max-w-44 min-w-0 cursor-pointer truncate text-xs text-(--color-secondary) hover:text-(--accent-default) lg:text-sm xl:max-w-64"
							href={service.url}
							rel="noopener noreferrer"
							target="_blank"
						>
							{service.url}
						</a>
					) : (
						<span className="max-w-44 truncate text-xs text-(--color-secondary) lg:text-sm xl:max-w-64">
							{address}
						</span>
					)}
				</div>
				<div className="flex flex-col gap-0.5 text-(--color-secondary)">
					<span className="text-xs">Последняя проверка:</span>
					<div className="mx-auto flex items-center gap-1">
						<span className="trim text-xs tabular-nums xl:text-sm">{lastChecked}</span>
						<Button
							centerIcon={
								<IconReload
									className={cn(
										'size-3.5 text-(--color-secondary) hover:text-(--accent-default)',
										isChecking && 'animate-spin'
									)}
								/>
							}
							className="size-5 rounded-lg hover:bg-(--accent-default)/10"
							disabled={isChecking}
							size="sm"
							title="Проверить сейчас"
							variant="mobile"
							onClick={checkMonitoredService}
						/>
					</div>
				</div>
			</div>
			<div className="my-3 grid grid-cols-3 rounded-xl bg-white/5 py-2.5">
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
