import { useEffect, useState } from 'react';
import { IconInfoCircle, IconUsers } from '@tabler/icons-react';

import { usePageTitle } from '@/shared/lib/hooks';
import { LoadingError, NoContent } from '@/shared/ui';

import { getMonitoring, type MonitoringData } from '../api';
import { MetricGroups, UserRow } from './components';

export const MonitoringPage = () => {
	usePageTitle('Мониторинг пользователей');

	const [data, setData] = useState<MonitoringData | null>(null);
	const [error, setError] = useState(false);
	const [attempt, setAttempt] = useState(0);
	const [expanded, setExpanded] = useState<string | null>(null);

	useEffect(() => {
		const controller = new AbortController();

		setError(false);
		setData(null);
		setExpanded(null);

		void getMonitoring(controller.signal)
			.then((result) => {
				if (!controller.signal.aborted) setData(result);
			})
			.catch(() => {
				if (!controller.signal.aborted) setError(true);
			});

		return () => controller.abort();
	}, [attempt]);

	if (!data) return <LoadingError error={error} size="lg" onRetry={() => setAttempt((value) => value + 1)} />;

	return (
		<section className="flex min-w-0 flex-1 flex-col gap-4">
			<div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
				<div className="rounded-xl bg-(--tone) p-4">
					<div className="mb-3 flex items-center gap-2">
						<IconUsers className="size-5 text-(--accent-primary)" />
						<h3 className="font-medium">Пользователи</h3>
					</div>
					<dl className="space-y-1.5 text-sm">
						{[
							['Всего', data.stats.users],
							['Новых за 7 дней', data.stats.newUsers7],
							['Новых за 30 дней', data.stats.newUsers],
						].map(([label, value]) => (
							<div key={label} className="flex items-center justify-between gap-3">
								<dt className="text-(--text-secondary)">{label}</dt>
								<dd className="font-medium tabular-nums">{value.toLocaleString('ru-RU')}</dd>
							</div>
						))}
					</dl>
				</div>
				<MetricGroups data={data.stats} sizes={data.stats} />
			</div>
			<div className="flex items-center gap-2 text-xs text-(--text-secondary)">
				<IconInfoCircle className="mt-0.5 size-4 shrink-0" />
				<p>
					Удалённые аккаунты исключены. Activity – сохранённые записи авторизаций (до 10 на пользователя).
					Устройства отдельно не учитываются. Объекты Kanban считаются по владельцу доски.
				</p>
			</div>
			<div className="min-w-0 rounded-xl bg-(--tone) p-3">
				<div className="flex items-center justify-between gap-2 px-3 py-2">
					<div className="flex items-center gap-2">
						<IconUsers className="size-4 text-(--text-secondary)" />
						<h3 className="font-medium">Пользователи</h3>
					</div>
					<span className="text-sm text-(--text-secondary) tabular-nums">{data.users.length}</span>
				</div>
				{data.users.length === 0 ? (
					<NoContent className="min-h-48" title="Пользователи не найдены" />
				) : (
					<div className="overflow-x-auto">
						<table className="w-full text-left text-sm [&_td]:px-3 [&_td]:py-3 [&_th]:px-3 [&_th]:py-2">
							<caption className="sr-only">Пользователи OneMate и использование модулей</caption>
							<thead className="text-(--text-secondary)">
								<tr>
									{['Пользователь', 'Регистрация / вход', 'Cloud', 'Объекты', 'Подробнее'].map(
										(title) => (
											<th key={title} className="font-medium whitespace-nowrap" scope="col">
												{title}
											</th>
										)
									)}
								</tr>
							</thead>
							<tbody>
								{data.users.map((user) => (
									<UserRow
										key={user.id}
										expanded={expanded === user.id}
										user={user}
										onToggle={() => setExpanded(expanded === user.id ? null : user.id)}
									/>
								))}
							</tbody>
						</table>
					</div>
				)}
			</div>
		</section>
	);
};
