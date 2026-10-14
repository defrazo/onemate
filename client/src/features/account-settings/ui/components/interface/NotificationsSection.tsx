import { useState } from 'react';
import { IconActivityHeartbeat, IconLayoutKanban } from '@tabler/icons-react';
import { observer } from 'mobx-react-lite';

import { useStore } from '@/app/providers';
import { Divider, Switch } from '@/shared/ui';

export const NotificationsSection = observer(() => {
	const { notificationStore, notifyStore, userProfileStore } = useStore();

	const [isNetworkLoading, setIsNetworkLoading] = useState(false);
	const [isKanbanLoading, setIsKanbanLoading] = useState(false);

	const networkNotificationsEnabled = userProfileStore.profile?.network_notifications_enabled ?? true;
	const kanbanNotificationsEnabled = userProfileStore.profile?.kanban_notifications_enabled ?? true;

	const handleBrowserNotificationsChange = (enabled: boolean) => {
		void notificationStore.setBrowserNotificationsEnabled(enabled);
	};

	const handleNetworkNotificationsChange = async (enabled: boolean): Promise<void> => {
		if (isNetworkLoading) return;

		try {
			setIsNetworkLoading(true);

			await userProfileStore.updateProfile({ network_notifications_enabled: enabled });

			notifyStore.setNotice(`Уведомления о сервисах ${enabled ? 'включены' : 'отключены'}`, 'success');
		} catch {
			notifyStore.setNotice('Что-то пошло не так', 'error');
		} finally {
			setIsNetworkLoading(false);
		}
	};

	const handleKanbanNotificationsChange = async (enabled: boolean): Promise<void> => {
		if (isKanbanLoading) return;

		try {
			setIsKanbanLoading(true);

			await userProfileStore.updateProfile({ kanban_notifications_enabled: enabled });

			notifyStore.setNotice(`Уведомления о задачах ${enabled ? 'включены' : 'отключены'}`, 'success');
		} catch {
			notifyStore.setNotice('Что-то пошло не так', 'error');
		} finally {
			setIsKanbanLoading(false);
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
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-2">
						<IconActivityHeartbeat className="size-5 text-(--accent-primary)" />
						<div className="flex flex-col">
							<span className="text-sm">Сеть</span>
							<span className="text-xs text-(--text-secondary) opacity-70">
								Изменение доступности отслеживаемых сервисов
							</span>
						</div>
					</div>
					<Switch
						checked={networkNotificationsEnabled}
						disabled={isNetworkLoading}
						onCheckedChange={handleNetworkNotificationsChange}
					/>
				</div>
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-2">
						<IconLayoutKanban className="size-5 text-(--accent-primary)" />
						<div className="flex flex-col">
							<span className="text-sm">Канбан</span>
							<span className="text-xs text-(--text-secondary) opacity-70">
								Уведомления о просроченных задачах
							</span>
						</div>
					</div>
					<Switch
						checked={kanbanNotificationsEnabled}
						disabled={isKanbanLoading}
						onCheckedChange={handleKanbanNotificationsChange}
					/>
				</div>
			</div>
		</section>
	);
});
