import { IconPointFilled, IconX } from '@tabler/icons-react';
import { observer } from 'mobx-react-lite';

import { useStore } from '@/app/providers';
import { cn } from '@/shared/lib/utils';
import { Button } from '@/shared/ui';

import { type AppNotification, notificationConfig } from '../../model';

export const Item = observer(({ notification }: { notification: AppNotification }) => {
	const { notificationStore: store } = useStore();

	const config = notificationConfig[notification.type];
	const isUnread = notification.readAt === null;

	const handleClick = () => {
		if (isUnread) void store.markAsRead(notification.id);
	};

	const handleDelete = () => void store.remove(notification.id);

	return (
		<div className="group relative border-b border-(--border-primary) transition-colors last:border-b-0 hover:bg-(--tone-hover)">
			<button className="w-full min-w-0 py-2 pr-3 pl-2 text-left" type="button" onClick={handleClick}>
				<div className="relative flex min-w-0 flex-1 flex-col gap-1 pl-3">
					<span className={cn('text-sm text-(--text-primary)', isUnread && 'font-semibold')}>
						{notification.title}
					</span>
					{isUnread && (
						<IconPointFilled className="absolute top-0.75 -left-0.5 size-3 text-(--accent-primary)" />
					)}
					<span className="line-clamp-2 text-xs text-(--text-secondary)">{notification.message}</span>
					<div className="mt-1 ml-auto flex items-center gap-1.5 text-(--text-disabled)">
						<span className="trim text-[11px] text-(--accent-primary)/70">
							{config?.source ?? 'OneMate'}
						</span>
						<span className="mx-0.5 size-0.75 rounded-full bg-current opacity-60" />
						<span className="trim text-[11px]">
							{new Date(notification.createdAt).toLocaleString('ru-RU', {
								day: '2-digit',
								month: '2-digit',
								hour: '2-digit',
								minute: '2-digit',
							})}
						</span>
					</div>
				</div>
			</button>
			<Button
				centerIcon={<IconX className="size-4" />}
				className="absolute top-1.5 right-2 transition-[color,opacity] group-hover:opacity-100 xl:opacity-0"
				padding="none"
				title="Удалить уведомление"
				type="button"
				variant="icon"
				onClick={handleDelete}
			/>
		</div>
	);
});
