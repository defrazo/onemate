import { IconClock, IconLogout, IconRestore } from '@tabler/icons-react';
import { observer } from 'mobx-react-lite';
import { useNavigate } from 'react-router-dom';

import { useStore } from '@/app/providers';
import { usePageTitle, useRemainingTime } from '@/shared/lib/hooks';
import { msFromDays } from '@/shared/lib/utils';
import { Button } from '@/shared/ui';

export const DeletedAccountPage = observer(() => {
	usePageTitle('Аккаунт удалён');

	const navigate = useNavigate();

	const { authStore, notifyStore, userStore } = useStore();

	const { days } = useRemainingTime(userStore.deletedAt, msFromDays(30));

	const handleRestore = async () => {
		try {
			await userStore.restoreAccount();

			notifyStore.setNotice('Аккаунт успешно восстановлен', 'success');
			navigate('/dashboard');
		} catch {
			notifyStore.setNotice('Не удалось восстановить аккаунт', 'error');
		}
	};

	const handleExit = async () => {
		await authStore.logout();
		navigate('/');
	};

	return (
		<div className="flex min-h-screen items-center justify-center px-4 select-none">
			<div className="core-surface core-pad flex max-w-md flex-col items-center gap-2 bg-(--bg-secondary) px-8 py-9 shadow-(--shadow-contrast)">
				<div className="relative flex size-24 items-center justify-center">
					<div className="absolute inset-0 rounded-full border border-(--border-primary)" />
					<div className="absolute inset-2 rounded-full bg-(--bg-tertiary)" />
					<div className="relative flex flex-col items-center gap-1">
						<span className="trim text-3xl font-semibold">{days}</span>
						<span className="trim text-xs text-(--text-secondary)">дней</span>
					</div>
					<div className="absolute right-0 bottom-1 flex size-7 items-center justify-center rounded-full bg-(--accent-primary)">
						<IconClock className="size-4 text-(--text-on-accent)" />
					</div>
				</div>
				<h1 className="text-xl font-semibold xl:text-2xl">Аккаунт ожидает удаления</h1>
				<div className="rounded-lg bg-(--accent-primary-muted) px-2.5 py-1 text-sm text-(--accent-primary)">
					{userStore.email}
				</div>
				<p className="max-w-sm text-center text-sm text-(--text-secondary)">
					Данные аккаунта пока сохранены. Восстановить доступ можно в течение оставшегося времени.
				</p>
				<div className="mt-3 flex flex-col items-center gap-2">
					<Button
						className="h-8 min-w-56"
						leftIcon={<IconRestore className="size-4" />}
						variant="accent"
						onClick={handleRestore}
					>
						<span className="trim">Восстановить аккаунт</span>
					</Button>
					<Button
						className="h-8 min-w-56"
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
