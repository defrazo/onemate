import { IconLogout2 } from '@tabler/icons-react';
import { observer } from 'mobx-react-lite';
import { useNavigate } from 'react-router-dom';

import { useStore } from '@/app/providers';
import { UserInfo } from '@/entities/user-profile';
import { Button, Divider } from '@/shared/ui';

import { desktopUserLinks } from '../model';

export const DesktopUserMenu = observer(({ onClose }: { onClose: () => void }) => {
	const navigate = useNavigate();

	const { authStore, modalStore } = useStore();

	const handleNavigate = (to: string) => {
		modalStore.closeModal();
		onClose();
		navigate(to);
	};

	const handleLogout = async () => {
		await authStore.logout();
		modalStore.closeModal();
		navigate('/');
	};

	return (
		<div className="core-surface absolute top-full right-0 mt-1 flex w-68 flex-col rounded-lg bg-(--bg-secondary) p-1.5 shadow-(--shadow-contrast)">
			<UserInfo className="px-2.5 py-1.5" />
			<Divider className="mx-2 bg-(--border-primary)" margY="xs" />
			<div className="my-1 flex flex-col gap-1">
				{desktopUserLinks.map(({ to, icon: Icon, label }) => (
					<Button
						key={to}
						className="h-8 justify-start bg-transparent"
						leftIcon={<Icon className="size-4.5" />}
						padding="sm"
						variant="tone"
						onClick={() => handleNavigate(to)}
					>
						{label}
					</Button>
				))}
			</div>
			<Divider className="mx-2 bg-(--border-primary)" margY="xs" />
			<Button
				className="mt-1 h-8 justify-start bg-transparent"
				leftIcon={<IconLogout2 className="size-4.5" />}
				padding="sm"
				variant="tone"
				onClick={handleLogout}
			>
				Выйти
			</Button>
		</div>
	);
});
