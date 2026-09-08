import { observer } from 'mobx-react-lite';

import { useStore } from '@/app/providers';
import { UserAvatar } from '@/entities/user-profile';
import { useCopy } from '@/shared/lib/hooks';
import { cn } from '@/shared/lib/utils';

export const UserInfo = observer(({ className }: { className?: string }) => {
	const copy = useCopy();

	const { userStore } = useStore();

	return (
		<div className={cn('flex items-center gap-3 select-none', className)}>
			<div className="flex items-center gap-3">
				<UserAvatar className="size-11 shrink-0" />
				<div className="flex flex-col">
					<div
						className="cursor-copy truncate font-semibold"
						onClick={() => copy(userStore.username, 'Имя пользователя скопировано!')}
					>
						{userStore.username}
					</div>
					<div
						className="cursor-copy truncate text-sm text-(--color-secondary) opacity-60"
						title={userStore.email}
						onClick={() => copy(userStore.email, 'E-mail пользователя скопирован!')}
					>
						{userStore.email}
					</div>
				</div>
			</div>
		</div>
	);
});
