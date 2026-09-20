import { IconInbox, IconTrash } from '@tabler/icons-react';
import { observer } from 'mobx-react-lite';

import { useStore } from '@/app/providers';
import { Button } from '@/shared/ui';

import { Item } from '.';

export const Menu = observer(() => {
	const { notificationStore: store } = useStore();

	return (
		<div className="core-border absolute top-full -right-14 z-50 mt-1 min-h-88 w-[85svw] max-w-88 min-w-0 overflow-visible rounded-xl bg-(--bg-secondary) shadow-(--shadow) xl:right-0">
			<div className="flex items-center justify-between px-4 py-2.5">
				<div className="flex items-center gap-2">
					<span className="trim font-bold text-(--color-primary)">Уведомления</span>
					{store.unreadCount > 0 && (
						<span className="mt-1 rounded-full bg-(--accent-default)/10 px-1.5 py-0.5 text-xs text-(--accent-default)">
							{store.unreadCount}
						</span>
					)}
				</div>
				<div className="flex items-center">
					{store.unreadCount > 0 && (
						<Button
							className="rounded-lg px-2 py-1 text-xs text-(--color-secondary) transition hover:bg-(--accent-default)/10 hover:text-(--accent-default)"
							type="button"
							variant="mobile"
							onClick={() => void store.markAllAsRead()}
						>
							Прочитать все
						</Button>
					)}
					<Button
						centerIcon={<IconTrash className="size-4" />}
						className="size-6 text-(--color-secondary)/70 transition hover:text-(--status-error)"
						size="custom"
						title="Удалить все"
						type="button"
						variant="mobile"
						onClick={() => void store.removeAll()}
					/>
				</div>
			</div>
			<div className="hide-scrollbar max-h-88 overflow-y-auto border-t border-(--border-color)">
				{store.notifications.length > 0 ? (
					store.notifications.map((notification) => (
						<Item key={notification.id} notification={notification} />
					))
				) : (
					<div className="flex min-h-40 flex-col items-center justify-center px-4 py-8 text-center">
						<div className="mb-1 flex size-10 items-center justify-center rounded-xl bg-white/3">
							<IconInbox className="size-5 text-(--color-disabled)" />
						</div>
						<span className="text-sm font-medium text-(--color-secondary)">Уведомлений пока нет</span>
						<span className="text-xs leading-relaxed text-(--color-disabled)">
							Здесь появятся новые уведомления
						</span>
					</div>
				)}
			</div>
		</div>
	);
});
