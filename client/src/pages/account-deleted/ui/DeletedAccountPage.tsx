import { IconClock, IconLogout, IconRestore } from '@tabler/icons-react';
import { observer } from 'mobx-react-lite';

import { useStore } from '@/app/providers';
import { usePageTitle, useRemainingTime } from '@/shared/lib/hooks';
import { msFromDays } from '@/shared/lib/utils';
import { Button } from '@/shared/ui';

import { useDeletedAccount } from '../model';

export const DeletedAccountPage = observer(() => {
	usePageTitle('Аккаунт удалён');

	const { userStore } = useStore();
	const { handleRestore, handleExit } = useDeletedAccount();

	const { days } = useRemainingTime(userStore.deletedAt, msFromDays(30));

	return (
		<div className="flex min-h-screen items-center justify-center px-4 select-none">
			<div className="core-card core-base flex max-w-md flex-col items-center gap-2 px-8 py-9 shadow-(--shadow)">
				<div className="relative flex size-24 items-center justify-center">
					<div className="absolute inset-0 rounded-full border border-(--border-color)" />
					<div className="absolute inset-2 rounded-full bg-(--bg-tertiary)" />
					<div className="relative flex flex-col items-center gap-1">
						<span className="trim text-3xl font-bold">{days}</span>
						<span className="trim text-xs text-(--color-secondary)">дней</span>
					</div>
					<div className="absolute right-0 bottom-1 flex size-7 items-center justify-center rounded-full bg-(--accent-default)">
						<IconClock className="size-4 text-(--accent-text)" />
					</div>
				</div>
				<h1 className="text-xl font-bold xl:text-2xl">Аккаунт ожидает удаления</h1>
				<div className="rounded-lg bg-(--accent-default)/10 px-2.5 py-1 text-sm text-(--accent-default)">
					{userStore.email}
				</div>
				<p className="max-w-sm text-center text-sm text-(--color-secondary)">
					Данные аккаунта пока сохранены. Восстановить доступ можно в течение оставшегося времени.
				</p>
				<div className="mt-3 flex flex-col items-center gap-2">
					<Button
						className="h-8 w-fit"
						leftIcon={<IconRestore className="size-4" />}
						variant="accent"
						onClick={handleRestore}
					>
						<span className="trim">Восстановить аккаунт</span>
					</Button>
					<Button
						className="h-8 w-fit"
						leftIcon={<IconLogout className="size-4" />}
						variant="ghost"
						onClick={handleExit}
					>
						<span className="trim">Выйти из аккаунта</span>
					</Button>
				</div>
			</div>
		</div>
	);
});
