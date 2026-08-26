import { observer } from 'mobx-react-lite';

import { useStore } from '@/app/providers';
import UserAvatar from '@/features/user-avatar';
import { cn } from '@/shared/lib/utils';
import { Button, Divider, LoadFallback, Preloader } from '@/shared/ui';

import type { ProfileNavButton } from '../model';
import { useProfile } from '../model';

const buttons: ProfileNavButton[] = [
	{ id: 'overview', title: 'Главная' },
	{ id: 'personal', title: 'Личные данные' },
	{ id: 'contacts', title: 'Контакты и адреса' },
	{ id: 'secure', title: 'Безопасность' },
];

export const ProfileNav = observer(() => {
	const { profileStore, userStore } = useStore();
	const { searchParams, navigate } = useProfile();

	const currentTab = searchParams.get('tab') || 'preview';

	if (!profileStore.isReady) return <LoadFallback />;

	return (
		<div className="core-card core-base flex h-fit w-full flex-col gap-4 shadow-(--shadow) select-none">
			{!profileStore.isReady ? (
				<div className="flex min-h-[19.625rem] items-center justify-center">
					<Preloader className="size-25" />
				</div>
			) : (
				<div className="flex flex-col items-center gap-4">
					<UserAvatar />
					<div className="flex cursor-default flex-col items-center justify-center gap-2 leading-4">
						<div>{userStore.username}</div>
						<div>{userStore.email}</div>
					</div>
				</div>
			)}
			<Divider className="w-full bg-(--border-color)" />
			<div className="flex flex-col gap-2">
				{buttons.map(({ id, title }) => {
					return (
						<Button
							key={id}
							className={cn(
								'core-border',
								currentTab === id && 'bg-(--accent-default) text-(--accent-text)'
							)}
							onClick={() => navigate(`/account/profile?tab=${id}`)}
						>
							{title}
						</Button>
					);
				})}
			</div>
		</div>
	);
});
