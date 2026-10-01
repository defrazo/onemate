import { IconBook, IconHome, IconShieldLock, IconStack2, IconUser } from '@tabler/icons-react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { cn } from '@/shared/lib/utils';
import { Button, Divider } from '@/shared/ui';

import type { ProfileNavButton } from '../../../model';

const buttons: ProfileNavButton[] = [
	{ id: 'overview', title: 'Главная', icon: IconHome },
	{ id: 'personal', title: 'Личные данные', icon: IconUser },
	{ id: 'contacts', title: 'Контакты и адреса', icon: IconBook },
	{ id: 'secure', title: 'Безопасность', icon: IconShieldLock },
	{ id: 'interface', title: 'Интерфейс', icon: IconStack2 },
];

export const ProfileMenu = () => {
	const navigate = useNavigate();
	const [searchParams] = useSearchParams();

	const currentTab = searchParams.get('tab') || 'overview';

	return (
		<div className="core-base flex flex-col gap-2 rounded-xl p-3 shadow-(--shadow) select-none">
			<div className="flex flex-col items-center text-center">
				<h1 className="text-xl font-semibold">Настройки</h1>
				<div className="my-1 flex h-5.5 items-center justify-center rounded-lg bg-(--accent-primary)/10 px-2 py-1">
					<span className="trim text-sm text-(--accent-primary)">
						{currentTab === 'interface' ? 'Персонализация OneMate' : 'Управление аккаунтом'}
					</span>
				</div>
			</div>
			<Divider className="w-full bg-(--border-primary)" />
			<div className="mt-1 flex flex-col gap-2">
				{buttons.map(({ id, title, icon: Icon }) => (
					<Button
						key={id}
						className={cn(
							'justify-start transition-colors',
							currentTab === id
								? 'bg-(--accent-primary) text-(--text-on-accent)'
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
