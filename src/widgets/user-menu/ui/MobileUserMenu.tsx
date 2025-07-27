import { useNavigate } from 'react-router-dom';
import { observer } from 'mobx-react-lite';

import { authStore } from '@/features/user-auth';
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
import { modalStore, uiStore } from '@/shared/stores';
import { Button, Divider } from '@/shared/ui';
import type { TabId } from '@/widgets/user-profile';
import { ContactsTab, OverviewTab, PersonalTab, profileStore, SecureTab } from '@/widgets/user-profile';

import type { UserButton } from '../model';
import { UserMenuInfo } from '.';

export const MobileUserMenu = observer(() => {
	const isMobile = useIsMobile();
	const navigate = useNavigate();

	const tabs: Record<TabId, React.ReactElement> = {
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
			leftIcon: uiStore.theme === 'light' ? <IconDay className="size-6" /> : <IconNight className="size-6" />,
			action: () => uiStore.toggleTheme(),
			label: (
				<>
					Тема оформления:
					<span className="ml-auto text-[var(--accent-default)]">{uiStore.currentTheme}</span>
				</>
			),
		},
		{
			id: 'location',
			leftIcon: <IconLocation className="size-6" />,
			action: () => goTo('personal'),
			label: `${profileStore.location || 'Не указано'}`,
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
		<div className="top-6 z-60 flex h-[calc(100%-1.5rem)] w-full flex-col gap-2 overflow-auto p-4">
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
				onClick={async () => {
					await authStore.logout();
					modalStore.closeModal();
					navigate('/');
				}}
			>
				Выйти
			</Button>
		</div>
	);
});
