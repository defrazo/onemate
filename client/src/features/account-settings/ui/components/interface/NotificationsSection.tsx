import { useState } from 'react';
import { IconLayoutKanban, IconNetwork } from '@tabler/icons-react';
import { observer } from 'mobx-react-lite';

import { useStore } from '@/app/providers';
import { Switch } from '@/shared/ui';

export const NotificationsSection = observer(() => {
	const { notificationStore, userProfileStore } = useStore();

	const [isNetworkLoading, setIsNetworkLoading] = useState(false);

	const networkNotificationsEnabled = userProfileStore.profile?.network_notifications_enabled ?? true;

	const handleBrowserNotificationsChange = (enabled: boolean) => {
		void notificationStore.setBrowserNotificationsEnabled(enabled);
	};

	const handleNetworkNotificationsChange = async (enabled: boolean): Promise<void> => {
		if (isNetworkLoading) return;

		try {
			setIsNetworkLoading(true);

			await userProfileStore.updateProfile({ network_notifications_enabled: enabled });
		} finally {
			setIsNetworkLoading(false);
		}
	};

	return (
		<section className="flex flex-col gap-3 select-none">
			<div className="flex items-center justify-between">
				<p className="text-sm text-(--color-secondary) opacity-70 xl:text-base">
					Показывать новые уведомления в браузере
				</p>
				<Switch
					checked={notificationStore.browserNotificationsEnabled}
					disabled={!notificationStore.browserNotificationsSupported}
					onCheckedChange={handleBrowserNotificationsChange}
				/>
			</div>
			<div className="h-px bg-(--border-color)" />
			<div className="flex flex-col gap-2">
				<p className="text-xs text-(--color-secondary)">Источники</p>
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-2">
						<IconNetwork className="size-5 text-(--accent-default)" />
						<div className="flex flex-col">
							<span className="text-sm text-(--color-primary)">Сеть</span>
							<span className="text-xs text-(--color-secondary) opacity-70">
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
				<div className="flex items-center justify-between opacity-40">
					<div className="flex items-center gap-2">
						<IconLayoutKanban className="size-5" />
						<div className="flex flex-col">
							<span className="text-sm text-(--color-primary)">Канбан</span>
							<span className="text-xs text-(--color-secondary)">Уведомления о задачах и сроках</span>
						</div>
					</div>
					<Switch checked={false} disabled />
				</div>
			</div>
		</section>
	);
});
