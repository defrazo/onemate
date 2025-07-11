import { useNavigate } from 'react-router-dom';
import { observer } from 'mobx-react-lite';

import { authStore } from '@/features/user-auth';
import { IconContacts, IconDay, IconLogout, IconNight, IconShield, IconUser } from '@/shared/assets/icons';
import { storage } from '@/shared/lib/storage';
import { uiStore } from '@/shared/stores';
import { Button, Divider } from '@/shared/ui';

import type { UserButton } from '../model';
import { UserMenuInfo } from '.';

export const DesktopUserMenu = observer(() => {
	const navigate = useNavigate();
	const close = (tab?: string) => {
		uiStore.closeModal();
		if (tab) storage.set('savedTab', tab);
	};

	const userButtons: UserButton[] = [
		{
			id: 'info',
			icon: <IconUser className="size-6" />,
			to: '/user-profile',
			action: (e: React.MouseEvent<HTMLButtonElement>) => close(e.currentTarget.id),
			label: 'Личные данные',
		},
		{
			id: 'contacts',
			icon: <IconContacts className="size-6" />,
			to: '/user-profile',
			action: (e: React.MouseEvent<HTMLButtonElement>) => close(e.currentTarget.id),
			label: 'Контактные данные',
		},
		{
			id: 'secure',
			icon: <IconShield className="size-6" />,
			to: '/user-profile',
			action: (e: React.MouseEvent<HTMLButtonElement>) => close(e.currentTarget.id),
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
			<Divider className="bg-[var(--color-secondary)]" margX="md" margY="sm" />

			{userButtons.map((item) => {
				return (
					<Button
						key={item.id}
						className="h-10 justify-start rounded-none"
						id={item.id}
						leftIcon={item.icon}
						navigateTo={item.to}
						variant="mobile"
						onClick={item.action}
					>
						{item.label}
					</Button>
				);
			})}

			<Divider className="bg-[var(--color-secondary)]" margX="md" margY="sm" />
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
