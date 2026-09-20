import type { MonitoringHistory } from '../../../model/';
import { ResponseTimeChart } from '.';

interface ResourceHistoryProps {
	history: MonitoringHistory | null;
	isLoading: boolean;
	error: string | null;
}

export const ResourceHistory = ({ history, isLoading, error }: ResourceHistoryProps) => {
	if (isLoading) {
		return (
			<div className="flex min-h-0 flex-1 items-center justify-center rounded-xl bg-(--bg-tertiary)">
				<span className="text-xs text-(--color-disabled)">Загрузка истории...</span>
			</div>
		);
	}

	if (error) {
		return (
			<div className="flex min-h-0 flex-1 items-center justify-center rounded-xl bg-(--bg-tertiary)">
				<span className="text-xs text-(--status-error)">{error}</span>
			</div>
		);
	}

	if (!history || history.checks.length === 0) {
		return (
			<div className="flex min-h-0 flex-1 items-center justify-center rounded-xl bg-(--bg-tertiary)">
				<span className="text-xs text-(--color-disabled)">История пока отсутствует</span>
			</div>
		);
	}

	return (
		<div className="flex min-h-0 flex-1 flex-col gap-3 rounded-xl bg-(--bg-tertiary) p-3">
			<div className="flex items-center justify-between gap-3">
				<div className="flex flex-col">
					<span className="text-xs text-(--color-secondary)">История отклика</span>

					<span className="text-sm text-(--color-primary)">Последние 24 часа</span>
				</div>

				<div className="flex items-center gap-4 text-xs">
					<div className="flex flex-col items-end">
						<span className="text-(--color-secondary)">Доступность</span>
						<span className="text-(--color-primary) tabular-nums">
							{history.uptime !== null ? `${history.uptime}%` : '—'}
						</span>
					</div>

					<div className="flex flex-col items-end">
						<span className="text-(--color-secondary)">Сбои</span>
						<span className="text-(--color-primary) tabular-nums">{history.incidents}</span>
					</div>
				</div>
			</div>

			<ResponseTimeChart checks={history.checks} />
		</div>
	);
};
