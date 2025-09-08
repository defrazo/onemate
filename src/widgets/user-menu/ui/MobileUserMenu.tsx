import type { ReactElement } from 'react';
import { useNavigate } from 'react-router-dom';
import { observer } from 'mobx-react-lite';

import { useStore } from '@/app/providers';
import {
	IconAbout,
	IconAgreement,
	IconContacts,
	IconDay,
	IconForward,
	IconLocation,
	IconLogout,
	IconNight,
	IconSecure,
	IconShield,
	IconUser,
} from '@/shared/assets/icons';
import { useIsMobile } from '@/shared/lib/hooks';
import { Button, Divider } from '@/shared/ui';
import type { TabId } from '@/widgets/user-profile';
import { ContactsTab, OverviewTab, PersonalTab, SecureTab } from '@/widgets/user-profile';

import type { UserButton } from '../model';
import { UserMenuInfo } from '.';

export const MobileUserMenu = observer(() => {
	const { authStore, cityStore, modalStore, themeStore } = useStore();
	const isMobile = useIsMobile();
	const navigate = useNavigate();

	const tabs: Record<TabId, ReactElement> = {
		overview: <OverviewTab />,
		personal: <PersonalTab />,
		contacts: <ContactsTab />,
		secure: <SecureTab />,
	};

	const goTo = (tab: TabId) => {
		if (isMobile) {
			const component = tabs[tab];
			modalStore.setModal(component, 'sheet', {
				back: () => modalStore.setModal(<MobileUserMenu />, 'sheet'),
			});
		} else {
			navigate(`/account/profile?tab=${tab}`);
		}
	};

	const userButtons: UserButton[] = [
		{
			id: 'personal',
			leftIcon: <IconUser className="size-6" />,
			action: () => goTo('personal'),
			label: 'Личные данные',
		},
		{
			id: 'contacts',
			leftIcon: <IconContacts className="size-6" />,
			action: () => goTo('contacts'),
			label: 'Контактные данные',
		},
		{
			id: 'secure',
			leftIcon: <IconShield className="size-6" />,
			action: () => goTo('secure'),
			label: 'Безопасность',
		},
		{
			id: 'theme',
			leftIcon: themeStore.theme === 'light' ? <IconDay className="size-6" /> : <IconNight className="size-6" />,
			action: () => themeStore.toggleTheme(),
			label: (
				<>
					Тема оформления:
					<span className="ml-auto text-[var(--accent-default)]">{themeStore.currentTheme}</span>
				</>
			),
		},
		{
			id: 'location',
			leftIcon: <IconLocation className="size-6" />,
			action: () => goTo('personal'),
			label: `${cityStore.name || 'Не указано'}`,
		},
		{
			id: 'terms',
			leftIcon: <IconAgreement className="size-6" />,
			action: () => {
				navigate('/terms-of-service');
				modalStore.closeModal();
			},
			label: 'Пользовательское соглашение',
		},
		{
			id: 'privacy',
			leftIcon: <IconSecure className="size-6" />,
			action: () => {
				navigate('/privacy-policy');
				modalStore.closeModal();
			},
			label: 'Политика конфиденциальности',
		},
		{
			id: 'about',
			leftIcon: <IconAbout className="size-6" />,
			action: () => {
				navigate('/about');
				modalStore.closeModal();
			},
			label: 'О проекте',
		},
	];

	return (
		<div className="top-6 z-60 flex h-[calc(100%-1.5rem)] w-full flex-col gap-2 overflow-auto overscroll-contain p-4">
			<UserMenuInfo />
			<Divider />
			{userButtons.map((item) => {
				return (
					<Button
						key={item.id}
						className="h-10"
						leftIcon={item.leftIcon}
						variant="mobile"
						onClick={item.action}
					>
						{item.label}
						<IconForward className="ml-auto size-4" />
					</Button>
				);
			})}
			<Divider />
			<Button
				className="h-10 justify-start"
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
