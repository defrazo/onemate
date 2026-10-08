import { IconChevronRight, IconLogout2 } from '@tabler/icons-react';
import { observer } from 'mobx-react-lite';
import { useNavigate } from 'react-router-dom';

import { useStore } from '@/app/providers';
import { UserInfo } from '@/entities/user-profile';
import { accountSettingsTabs, type TabId } from '@/features/account-settings';
import { Button, Divider } from '@/shared/ui';

import { mobileUserMenuLinks, profileTabs } from '../model';

export const MobileUserMenu = observer(() => {
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

	const openProfileTab = (tab: TabId) => {
		const Tab = accountSettingsTabs[tab];
		modalStore.setModal(<Tab />, 'sheet', { back: () => modalStore.setModal(<MobileUserMenu />, 'sheet') });
	};

	return (
		<div className="flex h-full w-full flex-col overflow-auto overscroll-contain pb-2">
			<UserInfo className="px-2.5 py-2" />
			<Divider className="mx-2 bg-(--border-primary)" margY="xs" />
			<div className="flex flex-col">
				{profileTabs.map(({ id, icon: Icon, label }) => (
					<Button
						key={id}
						className="h-9 justify-start active:bg-(--tone-strong) active:text-(--accent-primary)"
						leftIcon={<Icon className="size-4.5" />}
						padding="sm"
						rightIcon={<IconChevronRight className="size-3.5 text-(--text-secondary)" />}
						variant="custom"
						onClick={() => openProfileTab(id)}
					>
						<span className="trim w-full text-left">{label}</span>
					</Button>
				))}
				{mobileUserMenuLinks.map(({ to, icon: Icon, label }) => (
					<Button
						key={to}
						className="h-9 justify-start text-(--text-secondary) active:bg-(--tone-strong) active:text-(--text-primary)"
						leftIcon={<Icon className="size-4.5" />}
						padding="sm"
						rightIcon={<IconChevronRight className="size-3.5 text-(--text-secondary)" />}
						variant="custom"
						onClick={() => handleNavigate(to)}
					>
						<span className="trim w-full text-left">{label}</span>
					</Button>
				))}
			</div>
			<Divider className="mx-2 bg-(--border-primary)" margY="xs" />
			<Button
				className="h-9 justify-start active:bg-(--tone-strong) active:text-(--accent-primary)"
				leftIcon={<IconLogout2 className="size-4.5" />}
				padding="sm"
				variant="custom"
				onClick={handleLogout}
			>
				<span className="trim">Выйти</span>
			</Button>
		</div>
	);
});
