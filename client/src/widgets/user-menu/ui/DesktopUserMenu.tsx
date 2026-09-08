import { useNavigate } from 'react-router-dom';
import { IconLogout2, IconSettings } from '@tabler/icons-react';
import { observer } from 'mobx-react-lite';

import { useStore } from '@/app/providers';
import { UserInfo } from '@/entities/user-profile';
import { Button, Divider } from '@/shared/ui';

import { userMenuLinks } from '../model';

export const DesktopUserMenu = observer(() => {
	const navigate = useNavigate();

	const { authStore, modalStore } = useStore();

	const handleNavigate = (to: string) => {
		modalStore.closeModal();
		navigate(to);
	};

	const handleLogout = async () => {
		await authStore.logout();
		modalStore.closeModal();
		navigate('/');
	};

	return (
		<div className="core-border absolute right-2.5 flex w-68 flex-col rounded-xl rounded-t-none! bg-(--bg-secondary) p-1.5 shadow-[0_16px_40px_rgba(0,0,0,0.4)]">
			<UserInfo className="px-2.5 py-2" />
			<Divider className="mx-2 bg-(--border-color)" margY="xs" />
			<div className="flex flex-col">
				<Button
					className="h-8 justify-start rounded-lg px-2.5 font-medium hover:bg-white/6 hover:text-(--accent-default)"
					leftIcon={<IconSettings className="size-4.5" />}
					variant="mobile"
					onClick={() => handleNavigate('/account/profile?tab=overview')}
				>
					<span className="trim">Настройки аккаунта</span>
				</Button>
				{userMenuLinks.map(({ to, icon: Icon, label }) => (
					<Button
						key={to}
						className="h-7 justify-start rounded-lg px-2.5 text-sm text-(--color-secondary) hover:bg-white/6 hover:text-(--color-primary)"
						leftIcon={<Icon className="size-4.5" />}
						variant="mobile"
						onClick={() => handleNavigate(to)}
					>
						<span className="trim">{label}</span>
					</Button>
				))}
			</div>
			<Divider className="mx-2 bg-(--border-color)" margY="xs" />
			<Button
				className="h-8 justify-start rounded-lg px-2.5 font-medium hover:bg-white/6 hover:text-(--accent-default)"
				leftIcon={<IconLogout2 className="size-4.5" />}
				variant="mobile"
				onClick={handleLogout}
			>
				<span className="trim">Выйти</span>
			</Button>
		</div>
	);
});
