import { useNavigate } from 'react-router-dom';
import { observer } from 'mobx-react-lite';

import { useStore } from '@/app/providers';
import { IconContacts, IconDay, IconLogout, IconMain, IconNight, IconShield, IconUser } from '@/shared/assets/icons';
import { Button, Divider } from '@/shared/ui';

import type { UserButton } from '../model';
import { UserMenuInfo } from '.';

export const DesktopUserMenu = observer(() => {
	const { authStore, modalStore, themeStore } = useStore();
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
			icon: themeStore.theme === 'light' ? <IconDay className="size-6" /> : <IconNight className="size-6" />,
			action: () => {
				themeStore.toggleTheme();
				modalStore.closeModal();
			},
			label: (
				<>
					Тема оформления:
					<span className="ml-1 font-semibold">{themeStore.currentTheme}</span>
				</>
			),
		},
	];

	return (
		<div className="core-border absolute right-2.5 flex w-xs flex-col rounded-t-none! bg-(--bg-secondary) py-2 shadow-[inset_0_16px_6px_-4px_rgba(0,0,0,0.2)]">
			<UserMenuInfo className="mt-2.5 px-4 py-2" />
			<Divider className="mx-2 bg-(--border-color)" margY="sm" />
			{userButtons.map(({ id, label, icon, action }) => {
				const isThemeToggle = id === 'theme';
				const handleClick = isThemeToggle
					? action
					: () => {
							modalStore.closeModal();
							navigate(`/account/profile?tab=${id}`);
						};
				return (
					<Button
						key={id}
						className="h-10 justify-start rounded-none hover:bg-(--accent-hover) hover:text-(--accent-text)"
						leftIcon={icon}
						variant="mobile"
						onClick={handleClick}
					>
						{label}
					</Button>
				);
			})}
			<Divider className="mx-2 bg-(--border-color)" margY="sm" />
			<Button
				className="h-10 justify-start rounded-none hover:bg-(--accent-hover) hover:text-(--accent-text)"
				leftIcon={<IconLogout className="size-6" />}
				variant="mobile"
				onClick={() => {
					authStore.logout();
					modalStore.closeModal();
					navigate('/');
				}}
			>
				Выйти
			</Button>
		</div>
	);
});
