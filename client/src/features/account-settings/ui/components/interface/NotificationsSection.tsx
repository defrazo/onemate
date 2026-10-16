import { useState } from 'react';
import { IconActivityHeartbeat, IconLayoutKanban } from '@tabler/icons-react';
import { observer } from 'mobx-react-lite';

import { useStore } from '@/app/providers';
import { Divider, Switch } from '@/shared/ui';

type NotificationKey = 'network_notifications_enabled' | 'kanban_notifications_enabled';

const sources = [
	{
		key: 'network_notifications_enabled',
		title: 'Сеть',
		description: 'Изменение доступности отслеживаемых сервисов',
		notice: 'Уведомления о сервисах',
		icon: IconActivityHeartbeat,
	},
	{
		key: 'kanban_notifications_enabled',
		title: 'Канбан',
		description: 'Уведомления о просроченных задачах',
		notice: 'Уведомления о задачах',
		icon: IconLayoutKanban,
	},
] satisfies {
	key: NotificationKey;
	title: string;
	description: string;
	notice: string;
	icon: typeof IconActivityHeartbeat;
}[];

export const NotificationsSection = observer(() => {
	const { notificationStore, notifyStore, userProfileStore } = useStore();

	const [loading, setLoading] = useState<Partial<Record<NotificationKey, boolean>>>({});

	const handleBrowserNotificationsChange = (enabled: boolean) => {
		void notificationStore.setBrowserNotificationsEnabled(enabled);
	};

	const handleSourceChange = async (key: NotificationKey, enabled: boolean): Promise<void> => {
		if (loading[key]) return;

		setLoading((prev) => ({ ...prev, [key]: true }));

		try {
			await userProfileStore.updateNotification({ [key]: enabled });

			const source = sources.find((source) => source.key === key);

			notifyStore.setNotice(
				`${source?.notice ?? 'Уведомления'} ${enabled ? 'включены' : 'отключены'}`,
				'success'
			);
		} catch (error) {
			notifyStore.setNotice(error instanceof Error ? error.message : 'Что-то пошло не так', 'error');
		} finally {
			setLoading((prev) => ({ ...prev, [key]: false }));
		}
	};

	return (
		<section className="flex flex-col gap-3 select-none">
			<div className="flex items-center justify-between">
				<p className="text-sm text-(--text-secondary) opacity-70 xl:text-base">
					Показывать новые уведомления в браузере
				</p>
				<Switch
					checked={notificationStore.browserNotificationsEnabled}
					disabled={!notificationStore.browserNotificationsSupported}
					onCheckedChange={handleBrowserNotificationsChange}
				/>
			</div>
			<Divider className="hidden xl:block" />
			<div className="flex flex-col gap-2">
				<p className="text-xs text-(--text-secondary)">Источники</p>

				{sources.map((source) => {
					const Icon = source.icon;

					return (
						<div key={source.key} className="flex items-center justify-between">
							<div className="flex items-center gap-2">
								<Icon className="size-5 text-(--accent-primary)" />
								<div className="flex flex-col">
									<span className="text-sm">{source.title}</span>
									<span className="text-xs text-(--text-secondary) opacity-70">
										{source.description}
									</span>
								</div>
							</div>
							<Switch
								checked={userProfileStore.profile?.[source.key] ?? true}
								disabled={!!loading[source.key]}
								onCheckedChange={(enabled) => void handleSourceChange(source.key, enabled)}
							/>
						</div>
					);
				})}
			</div>
		</section>
	);
});
