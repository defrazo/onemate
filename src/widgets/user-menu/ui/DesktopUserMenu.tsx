import { useNavigate } from 'react-router-dom';
import { observer } from 'mobx-react-lite';

import { authStore } from '@/features/user-auth';
import { IconContacts, IconDay, IconLogout, IconMain, IconNight, IconShield, IconUser } from '@/shared/assets/icons';
import { uiStore } from '@/shared/stores';
import { Button, Divider } from '@/shared/ui';

import type { UserButton } from '../model';
import { UserMenuInfo } from '.';

export const DesktopUserMenu = observer(() => {
	const navigate = useNavigate();

	const userButtons: UserButton[] = [
		{
			id: 'overview',
			icon: <IconMain className="size-6" />,
			label: 'Мой профиль',
		},
		{
			id: 'personal',
			icon: <IconUser className="size-6" />,
			label: 'Личные данные',
		},
		{
			id: 'contacts',
			icon: <IconContacts className="size-6" />,
			label: 'Контактные данные',
		},
		{
			id: 'secure',
			icon: <IconShield className="size-6" />,
			label: 'Безопасность',
		},
		{
			id: 'theme',
			icon: uiStore.theme === 'light' ? <IconDay className="size-6" /> : <IconNight className="size-6" />,
			action: () => uiStore.toggleTheme(),
			label: (
				<>
					Тема оформления:
					<span className="ml-1 font-semibold">{uiStore.currentTheme}</span>
				</>
			),
		},
	];

	return (
		<div className="core-elements absolute right-2.5 flex w-xs flex-col rounded-xl rounded-t-none py-2 shadow-[inset_0_16px_6px_-4px_rgba(0,0,0,0.2)]">
			<UserMenuInfo className="mt-2.5 px-4 py-2" />
			<Divider className="mx-2 bg-[var(--color-secondary)]" margY="sm" />

			{userButtons.map((item) => {
				const isThemeToggle = item.id === 'theme';
				const handleClick = isThemeToggle
					? item.action
					: () => {
							uiStore.closeModal();
							navigate(`/account/profile?tab=${item.id}`);
						};
				return (
					<Button
						key={item.id}
						className="h-10 justify-start rounded-none hover:bg-[var(--accent-hover)]"
						leftIcon={item.icon}
						variant="mobile"
						onClick={handleClick}
					>
						{item.label}
					</Button>
				);
			})}

			<Divider className="mx-2 bg-[var(--color-secondary)]" margY="sm" />
			<Button
				className="h-10 justify-start rounded-none"
				leftIcon={<IconLogout className="size-6" />}
				onClick={async () => {
					await authStore.logout();
					uiStore.closeModal();
					navigate('/');
				}}
			>
				Выйти
			</Button>
		</div>
	);
});
