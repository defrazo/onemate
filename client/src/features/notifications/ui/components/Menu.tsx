import { IconInbox, IconTrash } from '@tabler/icons-react';
import { observer } from 'mobx-react-lite';

import { useStore } from '@/app/providers';
import { Button, NoContent } from '@/shared/ui';

import { Item } from '.';

export const Menu = observer(() => {
	const { notificationStore: store } = useStore();

	return (
		<div className="core-surface absolute top-full right-0 z-50 mt-1 flex h-82 w-[72svw] flex-col overflow-hidden rounded-lg bg-(--bg-secondary) shadow-(--shadow-contrast) md:w-88">
			<div className="flex h-9 items-center justify-between px-4 py-2.5">
				<div className="flex items-center gap-2">
					<span className="trim text-sm font-semibold text-(--text-primary)">Уведомления</span>
					{store.unreadCount > 0 && (
						<span className="mt-0.5 rounded-md bg-(--accent-primary-muted) px-1.5 py-0.5 text-xs text-(--accent-primary)">
							{store.unreadCount}
						</span>
					)}
				</div>
				<div className="flex items-center gap-1">
					{store.unreadCount > 0 && (
						<Button
							className="rounded-md text-xs text-(--text-secondary) hover:bg-(--accent-primary-muted) hover:text-(--accent-primary)"
							padding="sm"
							type="button"
							variant="custom"
							onClick={() => void store.markAllAsRead()}
						>
							Прочитать все
						</Button>
					)}
					{store.notifications.length > 0 && (
						<Button
							centerIcon={<IconTrash className="size-4" />}
							className="hover:text-(--status-error)"
							padding="none"
							title="Удалить все"
							type="button"
							variant="icon"
							onClick={() => void store.removeAll()}
						/>
					)}
				</div>
			</div>
			<div className="flex-1 scrollbar-none overflow-y-auto border-t border-(--border-primary)">
				{store.notifications.length > 0 ? (
					store.notifications.map((notification) => (
						<Item key={notification.id} notification={notification} />
					))
				) : (
					<NoContent
						description="Здесь появятся новые уведомления"
						icon={IconInbox}
						title="Уведомлений пока нет"
					/>
				)}
			</div>
		</div>
	);
});
