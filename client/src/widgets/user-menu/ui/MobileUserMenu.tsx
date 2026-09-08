import { useNavigate } from 'react-router-dom';
import { IconChevronRight, IconLogout2 } from '@tabler/icons-react';
import { observer } from 'mobx-react-lite';

import { useStore } from '@/app/providers';
import { UserInfo } from '@/entities/user-profile';
import { accountSettingsTabs, type TabId } from '@/features/account-settings';
import { Button, Divider } from '@/shared/ui';

import { profileTabs, userMenuLinks } from '../model';

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
			<Divider className="mx-2 bg-(--border-color)" margY="xs" />
			<div className="flex flex-col">
				{profileTabs.map(({ id, icon: Icon, label }) => (
					<Button
						key={id}
						className="h-10 justify-start rounded-lg px-2.5 font-medium active:bg-white/6 active:text-(--accent-default)"
						leftIcon={<Icon className="size-4.5" />}
						rightIcon={<IconChevronRight className="size-3.5 text-(--color-secondary)" />}
						variant="mobile"
						onClick={() => openProfileTab(id)}
					>
						<span className="trim w-full text-left">{label}</span>
					</Button>
				))}
				{userMenuLinks.map(({ to, icon: Icon, label }) => (
					<Button
						key={to}
						className="h-10 justify-start rounded-lg px-2.5 text-(--color-secondary) active:bg-white/6 active:text-(--color-primary)"
						leftIcon={<Icon className="size-4.5" />}
						rightIcon={<IconChevronRight className="size-3.5 text-(--color-secondary)" />}
						variant="mobile"
						onClick={() => handleNavigate(to)}
					>
						<span className="trim w-full text-left">{label}</span>
					</Button>
				))}
			</div>
			<Divider className="mx-2 bg-(--border-color)" margY="xs" />
			<Button
				className="h-10 justify-start rounded-lg px-2.5 font-medium active:bg-white/6 active:text-(--accent-default)"
				leftIcon={<IconLogout2 className="size-4.5" />}
				variant="mobile"
				onClick={handleLogout}
			>
				<span className="trim">Выйти</span>
			</Button>
		</div>
	);
});
