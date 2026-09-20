import { useEffect, useState } from 'react';
import { IconArrowLeft, IconClock, IconRefresh, IconSettings } from '@tabler/icons-react';

import { cn } from '@/shared/lib/utils';
import { Button } from '@/shared/ui';

import { getMonitoringHistory } from '../../../api';
import { type MonitoredService, type MonitoringHistory, NetworkStore } from '../../../model';
import { ResourceHistory } from '.';

interface ResourceDetailsProps {
	store: NetworkStore;
	resource: MonitoredService;
	onBack: () => void;
	onSettings: () => void;
}

export const ResourceDetails = ({ store, resource, onBack, onSettings }: ResourceDetailsProps) => {
	const [isChecking, setIsChecking] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const [history, setHistory] = useState<MonitoringHistory | null>(null);
	const [isHistoryLoading, setIsHistoryLoading] = useState(true);
	const [historyError, setHistoryError] = useState<string | null>(null);

	const statusLabel = !resource.isActive
		? 'Мониторинг выключен'
		: resource.lastStatus === 'up'
			? 'Работает'
			: resource.lastStatus === 'down'
				? 'Недоступен'
				: 'Не проверялся';

	const lastChecked = resource.lastCheckedAt
		? new Date(resource.lastCheckedAt).toLocaleString('ru-RU', {
				day: '2-digit',
				month: '2-digit',
				hour: '2-digit',
				minute: '2-digit',
			})
		: 'Не проверялся';

	const checkResource = async () => {
		if (isChecking) {
			return;
		}

		setError(null);
		setIsChecking(true);

		try {
			await store.checkService(resource.id);
		} catch (error) {
			setError(error instanceof Error ? error.message : 'Не удалось проверить ресурс.');
		} finally {
			setIsChecking(false);
		}
	};

	useEffect(() => {
		let isCancelled = false;

		const loadHistory = async () => {
			setIsHistoryLoading(true);
			setHistoryError(null);

			try {
				const history = await getMonitoringHistory(resource.id);

				if (!isCancelled) {
					setHistory(history);
				}
			} catch (error) {
				if (!isCancelled) {
					setHistoryError(error instanceof Error ? error.message : 'Не удалось загрузить историю.');
				}
			} finally {
				if (!isCancelled) {
					setIsHistoryLoading(false);
				}
			}
		};

		void loadHistory();

		return () => {
			isCancelled = true;
		};
	}, [resource.id]);

	return (
		<div className="flex h-full min-h-0 flex-col gap-3">
			<div className="flex shrink-0 items-center justify-between border-b border-(--border-color) pb-2">
				<Button
					className="rounded-lg bg-white/5 px-2 py-1 text-xs text-(--color-secondary) hover:bg-white/6"
					leftIcon={<IconArrowLeft className="size-4" />}
					size="sm"
					title="Вернуться к ресурсам"
					variant="mobile"
					onClick={onBack}
				>
					Назад
				</Button>
				<div className="flex items-center gap-1">
					<Button
						centerIcon={<IconRefresh className={cn('size-4', isChecking && 'animate-spin')} />}
						disabled={isChecking}
						size="sm"
						title={resource.isActive ? 'Проверить сейчас' : 'Проверить вручную'}
						variant="mobile"
						onClick={checkResource}
					/>
					<Button
						centerIcon={<IconSettings className="size-4" />}
						size="sm"
						title="Настроить ресурс"
						variant="mobile"
						onClick={onSettings}
					/>
				</div>
			</div>
			<div className="flex items-center justify-between gap-4">
				<div className="flex min-w-0 flex-col">
					<span className="truncate text-base font-bold text-(--color-primary)">{resource.name}</span>

					<span className="truncate text-xs text-(--color-secondary)">{resource.url}</span>
				</div>
				{error && <span className="text-xs text-(--status-error)">{error}</span>}
				<div className="flex shrink-0 items-center gap-2">
					<span
						className={cn(
							'size-2 rounded-full',
							!resource.isActive && 'bg-(--color-disabled)',
							resource.isActive && resource.lastStatus === 'up' && 'bg-(--status-success)',
							resource.isActive && resource.lastStatus === 'down' && 'bg-(--status-error)',
							resource.isActive && resource.lastStatus === null && 'bg-(--color-disabled)'
						)}
					/>
					<span className="text-sm text-(--color-primary)">{statusLabel}</span>
				</div>
			</div>
			<div className="grid grid-cols-3 gap-2">
				<Metric
					label="Отклик"
					value={resource.lastResponseTime !== null ? `${resource.lastResponseTime} мс` : '—'}
				/>
				<Metric label="HTTP" value={resource.lastStatusCode !== null ? String(resource.lastStatusCode) : '—'} />
				<Metric label="Проверка" value={lastChecked} />
			</div>
			<ResourceHistory error={historyError} history={history} isLoading={isHistoryLoading} />
			<div className="flex shrink-0 items-center gap-1 text-xs text-(--color-disabled)">
				<IconClock className="size-3.5" />
				Последняя проверка: {lastChecked}
			</div>
		</div>
	);
};

const Metric = ({ label, value }: { label: string; value: string }) => {
	return (
		<div className="flex min-w-0 flex-col gap-0.5 rounded-xl bg-(--accent-default)/10 px-3 py-2">
			<span className="text-xs text-(--color-secondary)">{label}</span>
			<span className="truncate text-sm text-(--color-primary) tabular-nums">{value}</span>
		</div>
	);
};
