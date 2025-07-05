import { observer } from 'mobx-react-lite';

import { userStore } from '@/entities/user';
import UserAvatar from '@/features/user-avatar';
import { cn } from '@/shared/lib/utils';
import { Button } from '@/shared/ui';

import type { ProfileNavButton } from '../model';
import { profileStore } from '../model';

export const UserProfileNav = observer(() => {
	const buttons: ProfileNavButton[] = [
		{ id: 'profile', title: 'Главная' },
		{ id: 'info', title: 'Личные данные' },
		{ id: 'contacts', title: 'Контакты и адреса' },
		{ id: 'secure', title: 'Безопасность' },
	];

	return (
		<div className="flex h-full w-full flex-col gap-4">
			<div className="core-base flex flex-col items-center gap-4 rounded-xl p-4">
				<UserAvatar />
				<div className="flex flex-col items-center justify-center">
					<div>{userStore.user?.username}</div>
					<div>{userStore.user?.email}</div>
				</div>
			</div>
			<div className="flex flex-col gap-2">
				{buttons.map((item) => {
					return (
						<Button
							key={item.id}
							className={cn(
								profileStore.activeTab === item.id &&
									'bg-[var(--accent-default)] text-[var(--accent-text)]'
							)}
							onClick={() => profileStore.setActiveTab(item.id)}
						>
							{item.title}
						</Button>
					);
				})}
			</div>
		</div>
	);
});
