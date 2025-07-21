import { observer } from 'mobx-react-lite';

import { userStore } from '@/entities/user';
import UserAvatar from '@/features/user-avatar';
import { cn } from '@/shared/lib/utils';
import { Button, Divider, Preloader } from '@/shared/ui';

import type { ProfileNavButton } from '../model';
import { profileStore, useProfile } from '../model';

const buttons: ProfileNavButton[] = [
	{ id: 'overview', title: 'Главная' },
	{ id: 'personal', title: 'Личные данные' },
	{ id: 'contacts', title: 'Контакты и адреса' },
	{ id: 'secure', title: 'Безопасность' },
];

export const ProfileNav = observer(() => {
	const { searchParams, navigate } = useProfile();
	const currentTab = searchParams.get('tab') || 'preview';

	return (
		<div className="flex w-full flex-col gap-4">
			{!profileStore.isProfileUploaded ? (
				<div className="flex min-h-[19.625rem] items-center justify-center">
					<Preloader className="size-25" />
				</div>
			) : (
				<div className="core-base flex flex-col items-center gap-4 rounded-xl p-4">
					<UserAvatar />
					<Divider className="w-full" />
					<div className="flex flex-col items-center justify-center">
						<div>{userStore.username}</div>
						<div>{userStore.email}</div>
					</div>
				</div>
			)}
			<div className="flex flex-col gap-2">
				{buttons.map((item) => {
					return (
						<Button
							key={item.id}
							className={cn(
								currentTab === item.id && 'bg-[var(--accent-default)] text-[var(--accent-text)]'
							)}
							onClick={() => navigate(`/account/profile?tab=${item.id}`)}
						>
							{item.title}
						</Button>
					);
				})}
			</div>
		</div>
	);
});
