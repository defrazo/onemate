import { useNavigate } from 'react-router-dom';
import { observer } from 'mobx-react-lite';

import { userProfileStore } from '@/entities/userProfile';
import { authStore } from '@/features/auth';
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
import { uiStore } from '@/shared/stores';
import { Button, Divider } from '@/shared/ui';
import { ProfileContacts, ProfileInfo, ProfileSecure, profileStore, TabId } from '@/widgets/UserProfile';

import { UserMenuInfo } from '.';

export const MobileUserMenu = observer(() => {
	const isMobile = useIsMobile();
	const navigate = useNavigate();

	const goTo = (tab: TabId, to: React.ReactElement) => {
		if (isMobile) {
			uiStore.setModal(to, 'bottom-sheet', {
				back: () => uiStore.setModal(<MobileUserMenu />, 'bottom-sheet'),
			});
		} else {
			navigate('/user-profile');
			profileStore.setActiveTab(tab);
		}
	};

	const userButtons = [
		{
			id: 'info',
			leftIcon: <IconUser className="size-6" />,
			action: () => goTo('info', <ProfileInfo />),
			label: 'Личные данные',
		},
		{
			id: 'contacts',
			leftIcon: <IconContacts className="size-6" />,
			action: () => goTo('contacts', <ProfileContacts />),
			label: 'Контактные данные',
		},
		{
			id: 'secure',
			leftIcon: <IconShield className="size-6" />,
			action: () => goTo('secure', <ProfileSecure />),
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
			action: () => goTo('secure', <ProfileSecure />),
			label: `Местоположение: ${userProfileStore.location || 'Не указано'}`,
		},
		{
			id: 'terms',
			leftIcon: <IconAgreement className="size-6" />,
			action: () => {
				navigate('/terms');
				uiStore.closeModal();
			},
			label: 'Пользовательское соглашение',
		},
		{
			id: 'privacy',
			leftIcon: <IconSecure className="size-6" />,
			action: () => {
				navigate('/privacy');
				uiStore.closeModal();
			},
			label: 'Политика конфиденциальности',
		},
		{
			id: 'about',
			leftIcon: <IconAbout className="size-6" />,
			action: () => {
				navigate('/about');
				uiStore.closeModal();
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
					close();
					navigate('/');
				}}
			>
				Выйти
			</Button>
		</div>
	);
});
