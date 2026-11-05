import {
	type Icon,
	IconBell,
	IconChecklist,
	IconCloud,
	IconLayoutKanban,
	IconMapPin,
	IconNetwork,
	IconNotes,
} from '@tabler/icons-react';

import { formatFileSize } from '@/widgets/cloud';

import type { MonitoringCounts } from '../../api';

interface MetricGroup {
	title: string;
	icon: Icon;
	metrics: [keyof MonitoringCounts, string][];
}

const groups: MetricGroup[] = [
	{
		title: 'Cloud',
		icon: IconCloud,
		metrics: [
			['cloudFiles', 'Файлы'],
			['cloudBytes', 'Объём'],
		],
	},
	{
		title: 'Notes',
		icon: IconNotes,
		metrics: [['notes', 'Заметки']],
	},
	{
		title: 'ToDo',
		icon: IconChecklist,
		metrics: [
			['todoCanvases', 'Холсты'],
			['todoLists', 'Списки'],
			['todoItems', 'Пункты'],
			['todoCompleted', 'Завершено'],
		],
	},
	{
		title: 'Kanban',
		icon: IconLayoutKanban,
		metrics: [
			['kanbanBoards', 'Доски'],
			['kanbanColumns', 'Колонки'],
			['kanbanTasks', 'Задачи'],
			['kanbanCompleted', 'Завершено'],
		],
	},
	{
		title: 'Activity / Location',
		icon: IconMapPin,
		metrics: [
			['authLogs', 'Записи авторизаций'],
			['locations', 'Локации'],
		],
	},
	{
		title: 'Network',
		icon: IconNetwork,
		metrics: [
			['networkServices', 'Объекты'],
			['networkChecks', 'Сохранённые проверки'],
		],
	},
	{
		title: 'Уведомления',
		icon: IconBell,
		metrics: [['notifications', 'Сохранённые']],
	},
];

interface MetricGroupsProps {
	data: MonitoringCounts;
	sizes?: { cloudAverageBytes: number; cloudMaxBytes: number };
}

export const MetricGroups = ({ data, sizes }: MetricGroupsProps) => (
	<>
		{groups.map(({ title, icon: IconComponent, metrics }) => (
			<div key={title} className="rounded-xl bg-(--tone) p-4">
				<div className="mb-3 flex items-center gap-2">
					<IconComponent className="size-5 text-(--accent-primary)" stroke={1.75} />
					<h3 className="font-medium">{title}</h3>
				</div>
				<dl className="space-y-1.5 text-sm">
					{metrics.map(([key, label]) => (
						<div key={key} className="flex items-center justify-between gap-3">
							<dt className="text-(--text-secondary)">{label}</dt>
							<dd className="font-medium whitespace-nowrap tabular-nums">
								{key === 'cloudBytes' ? formatFileSize(data[key]) : data[key].toLocaleString('ru-RU')}
							</dd>
						</div>
					))}
					{metrics.some(([key]) => key === 'cloudBytes') && sizes && (
						<>
							<div className="flex items-center justify-between gap-3">
								<dt className="text-(--text-secondary)">Средний файл</dt>
								<dd className="font-medium whitespace-nowrap tabular-nums">
									{formatFileSize(Math.round(sizes.cloudAverageBytes))}
								</dd>
							</div>
							<div className="flex items-center justify-between gap-3">
								<dt className="text-(--text-secondary)">Максимальный файл</dt>
								<dd className="font-medium whitespace-nowrap tabular-nums">
									{formatFileSize(sizes.cloudMaxBytes)}
								</dd>
							</div>
						</>
					)}
				</dl>
			</div>
		))}
	</>
);
