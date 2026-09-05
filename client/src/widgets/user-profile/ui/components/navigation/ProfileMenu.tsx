import { IconBookFilled, IconHomeFilled, IconShieldLockFilled, IconUserFilled } from '@tabler/icons-react';

import { cn } from '@/shared/lib/utils';
import { Button, Divider } from '@/shared/ui';

import { type ProfileNavButton, useProfile } from '../../../model';

const buttons: ProfileNavButton[] = [
	{ id: 'overview', title: 'Главная', icon: IconHomeFilled },
	{ id: 'personal', title: 'Личные данные', icon: IconUserFilled },
	{ id: 'contacts', title: 'Контакты и адреса', icon: IconBookFilled },
	{ id: 'secure', title: 'Безопасность', icon: IconShieldLockFilled },
];

export const ProfileMenu = () => {
	const { searchParams, navigate } = useProfile();

	const currentTab = searchParams.get('tab') || 'overview';

	return (
		<div className="core-base flex flex-col gap-2 rounded-xl p-3 shadow-(--shadow) select-none">
			<div className="flex flex-col text-center">
				<h1 className="text-xl font-semibold">Настройки</h1>
				<span className="text-sm text-(--color-secondary) opacity-60">Управление аккаунтом</span>
			</div>
			<Divider className="w-full bg-(--border-color)" />
			<div className="flex flex-col gap-2">
				{buttons.map(({ id, title, icon: Icon }) => (
					<Button
						key={id}
						className={cn(
							'justify-start',
							currentTab === id
								? 'bg-(--accent-default) text-(--accent-text)'
								: 'bg-transparent hover:bg-white/10'
						)}
						leftIcon={<Icon className="size-5.5" />}
						onClick={() => navigate(`/account/profile?tab=${id}`)}
					>
						{title}
					</Button>
				))}
			</div>
		</div>
	);
};
