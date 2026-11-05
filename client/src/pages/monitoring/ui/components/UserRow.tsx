import { Fragment } from 'react';
import { IconChevronDown, IconCloud } from '@tabler/icons-react';

import { cn, fullDate } from '@/shared/lib/utils';
import { Button, Collapse } from '@/shared/ui';
import { formatFileSize } from '@/widgets/cloud';

import type { MonitoringData } from '../../api';
import { MetricGroups } from '.';

type MonitoringUser = MonitoringData['users'][number];

interface UserRowProps {
	user: MonitoringUser;
	expanded: boolean;
	onToggle: () => void;
}

export const UserRow = ({ user, expanded, onToggle }: UserRowProps) => {
	return (
		<Fragment>
			<tr className="border-t border-(--border-contrast)/10 align-middle">
				<td>
					<div className="flex items-center gap-3">
						<div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-(--accent-primary-muted) font-medium text-(--accent-primary)">
							{user.username.charAt(0).toUpperCase()}
						</div>
						<div className="min-w-0">
							<div className="flex flex-wrap items-center gap-2">
								<span className="font-medium">{user.username}</span>
								<span className="rounded bg-(--border-contrast)/10 px-1.5 py-0.5 text-[10px] text-(--text-secondary)">
									{user.role}
								</span>
							</div>
							<div className="text-xs break-all text-(--text-secondary)">{user.email}</div>
						</div>
					</div>
				</td>
				<td className="whitespace-nowrap">
					<div title="Дата регистрации">{user.createdAt ? fullDate(user.createdAt) : '—'}</div>
					<div className="text-(--text-secondary)" title="Последний вход">
						{user.lastLoginAt ? fullDate(user.lastLoginAt) : 'Входов нет'}
					</div>
				</td>
				<td className="whitespace-nowrap">
					<div className="flex items-center gap-1.5">
						<IconCloud className="size-4 text-(--text-secondary)" />
						<span className="tabular-nums">{user.cloudFiles.toLocaleString('ru-RU')} файлов</span>
					</div>
					<div className="mt-1 text-xs text-(--text-secondary)">{formatFileSize(user.cloudBytes)}</div>
				</td>
				<td className="text-xs whitespace-nowrap">
					<div className="flex gap-2">
						<span className="w-14 text-(--text-secondary)">Notes</span>
						<span className="tabular-nums">{user.notes}</span>
					</div>
					<div className="flex gap-2">
						<span className="w-14 text-(--text-secondary)">ToDo</span>
						<span className="tabular-nums">{user.todoItems}</span>
					</div>
					<div className="flex gap-2">
						<span className="w-14 text-(--text-secondary)">Kanban</span>
						<span className="tabular-nums">{user.kanbanTasks}</span>
					</div>
				</td>
				<td>
					<Button
						aria-controls={`metrics-${user.id}`}
						aria-expanded={expanded}
						className="h-8 gap-2 text-xs"
						onClick={onToggle}
					>
						{expanded ? 'Скрыть' : 'Метрики'}
						<IconChevronDown className={cn('size-4 transition-transform', expanded && 'rotate-180')} />
					</Button>
				</td>
			</tr>
			<tr>
				<td className="py-0!" colSpan={5}>
					<Collapse open={expanded}>
						<div
							className="grid gap-3 pb-3 sm:grid-cols-2 xl:grid-cols-4"
							id={`metrics-${user.id}`}
							inert={!expanded}
						>
							<MetricGroups data={user} />
						</div>
					</Collapse>
				</td>
			</tr>
		</Fragment>
	);
};
