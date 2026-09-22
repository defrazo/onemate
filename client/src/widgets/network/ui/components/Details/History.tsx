import { IconChartLine, IconHistory, IconLoader2, IconPower } from '@tabler/icons-react';

import { cn } from '@/shared/lib/utils';

import { getUptimeClass } from '../../../lib';
import type { MonitoringHistory } from '../../../model';
import { HistoryState, TimeChart } from '.';

interface HistoryProps {
	history: MonitoringHistory | null;
	isActive: boolean;
	isLoading: boolean;
	isError: boolean;
}

export const History = ({ history, isActive, isLoading, isError }: HistoryProps) => {
	if (isLoading) {
		return (
			<HistoryState
				desc="Получаем данные последних проверок"
				icon={IconLoader2}
				loading
				title="Загружаем историю"
			/>
		);
	}

	if (isError) {
		return (
			<HistoryState desc="Попробуйте обновить страницу" icon={IconHistory} title="Не удалось загрузить историю" />
		);
	}

	if (!history || history.checks.length === 0) {
		return (
			<HistoryState
				desc={
					isActive ? 'Данные появятся после первой проверки' : 'Включите мониторинг, чтобы начать сбор данных'
				}
				icon={isActive ? IconChartLine : IconPower}
				title={isActive ? 'Истории пока нет' : 'Мониторинг выключен'}
			/>
		);
	}

	return (
		<div className="flex min-h-0 flex-col">
			<div className="relative flex justify-between">
				<div className="flex flex-col gap-0.5 pl-2 text-(--color-secondary)">
					<div className="flex items-center gap-1">
						<IconHistory className="size-3" />
						<span className="trim text-sm">История отклика</span>
					</div>
					<span className="text-[10px]">Последние 24 часа</span>
				</div>
				{!isActive && (
					<div className="absolute -top-0.5 left-1/2 flex -translate-x-1/2 flex-col items-center text-[10px] text-(--color-secondary)">
						<div className="flex size-5 items-center justify-center rounded-md bg-(--warning-default)/10">
							<IconPower className="size-3 text-(--warning-default)" />
						</div>
						Мониторинг выключен
					</div>
				)}
				<div className="flex gap-3 pr-2">
					<div className="flex flex-col items-center">
						<span className="text-[10px] text-(--color-secondary)">Доступность</span>
						<span className={cn('text-sm tabular-nums opacity-80', getUptimeClass(history.uptime))}>
							{history.uptime !== null ? `${history.uptime}%` : '–'}
						</span>
					</div>
					<div className="flex flex-col items-center">
						<span className="text-[10px] text-(--color-secondary)">Сбои</span>
						<span
							className={cn(
								'text-sm tabular-nums opacity-80',
								history.incidents === 0 ? 'text-(--status-success)' : 'text-(--status-error)'
							)}
						>
							{history.incidents}
						</span>
					</div>
				</div>
			</div>
			<TimeChart checks={history.checks} />
		</div>
	);
};
