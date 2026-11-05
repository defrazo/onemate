import { useState } from 'react';
import { IconActivityHeartbeat, IconLayoutKanban } from '@tabler/icons-react';
import { observer } from 'mobx-react-lite';

import { useStore } from '@/app/providers';
import { Checkbox, Divider, Switch } from '@/shared/ui';

type NotificationKey =
	| 'network_notifications_enabled'
	| 'kanban_notifications_enabled'
	| 'network_email_notifications_enabled'
	| 'kanban_email_notifications_enabled';

const sources = [
	{
		key: 'network_notifications_enabled',
		emailKey: 'network_email_notifications_enabled',
		title: 'Сеть',
		description: 'Изменение доступности отслеживаемых сервисов',
		notice: 'Уведомления о сервисах',
		icon: IconActivityHeartbeat,
	},
	{
		key: 'kanban_notifications_enabled',
		emailKey: 'kanban_email_notifications_enabled',
		title: 'Канбан',
		description: 'Напоминания о сроках и просроченных задачах',
		notice: 'Уведомления о задачах',
		icon: IconLayoutKanban,
	},
] satisfies {
	key: NotificationKey;
	emailKey: NotificationKey;
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
		if (loading[key] || userProfileStore.isLoading) return;

		setLoading((prev) => ({ ...prev, [key]: true }));

		try {
			await userProfileStore.updateNotification({ [key]: enabled });

			const source = sources.find((source) => source.key === key || source.emailKey === key);
			const channel = source?.emailKey === key ? 'Email' : 'В приложении';

			notifyStore.setNotice(
				`${source?.notice ?? 'Уведомления'} (${channel}) ${enabled ? 'включены' : 'отключены'}`,
				'success'
			);
		} catch (error) {
			notifyStore.setNotice(error instanceof Error ? error.message : 'Что-то пошло не так', 'error');
		} finally {
			setLoading((prev) => ({ ...prev, [key]: false }));
		}
	};

	return (
		<section className="flex flex-col gap-3 select-none xl:min-h-40">
			<div className="flex items-center justify-between gap-4">
				<p className="text-sm text-(--text-secondary) opacity-70">Показывать новые уведомления в браузере</p>
				<Switch
					checked={notificationStore.browserNotificationsEnabled}
					disabled={!notificationStore.browserNotificationsSupported}
					onCheckedChange={handleBrowserNotificationsChange}
				/>
			</div>
			<Divider className="hidden xl:block" />
			<div className="flex flex-col gap-1">
				<div className="grid grid-cols-[minmax(0,1fr)_88px_64px] items-end gap-2 pb-1 xl:pr-3">
					<span className="text-xs text-(--text-secondary)">Источники</span>
					<span className="text-center text-xs text-(--text-secondary)">В приложении</span>
					<span className="text-center text-xs text-(--text-secondary)">Email</span>
				</div>
				{sources.map((source) => {
					const Icon = source.icon;

					return (
						<div
							key={source.key}
							className="grid grid-cols-[minmax(0,1fr)_88px_64px] items-center gap-2 py-1 xl:rounded-lg xl:px-3 xl:transition-colors xl:hover:bg-(--tone-hover)"
						>
							<div className="flex min-w-0 items-center gap-2">
								<Icon className="size-5 shrink-0 text-(--accent-primary)" />
								<div className="flex min-w-0 flex-col">
									<span className="text-sm">{source.title}</span>
									<span className="-mt-0.5 text-xs text-(--text-secondary) opacity-70">
										{source.description}
									</span>
								</div>
							</div>
							<div className="flex justify-center">
								<Checkbox
									aria-label={`${source.title}: в приложении`}
									checked={userProfileStore.profile?.[source.key] ?? true}
									className="has-checked:[&_svg]:text-(--accent-primary)"
									disabled={userProfileStore.isLoading || !!loading[source.key]}
									onChange={(enabled) => void handleSourceChange(source.key, enabled)}
								/>
							</div>
							<div className="flex justify-center">
								<Checkbox
									aria-label={`${source.title}: Email`}
									checked={userProfileStore.profile?.[source.emailKey] ?? false}
									className="has-checked:[&_svg]:text-(--accent-primary)"
									disabled={userProfileStore.isLoading || !!loading[source.emailKey]}
									onChange={(enabled) => void handleSourceChange(source.emailKey, enabled)}
								/>
							</div>
						</div>
					);
				})}
			</div>
		</section>
	);
});
