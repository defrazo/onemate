import { UserAvatar, userStore } from '@/entities/user';
import { userProfileStore } from '@/entities/userProfile';
import {
	IconAbout,
	IconAgreement,
	IconForward,
	IconLocation,
	IconLogout,
	IconNight,
	IconSecure,
	IconShield,
	IconUser,
} from '@/shared/assets/icons';
import { appStore } from '@/shared/store/appStore';
import { Button, Divider } from '@/shared/ui';

interface MobileUserMenuProps {
	onLogout: () => void;
}

const MobileUserMenu = ({ onLogout }: MobileUserMenuProps) => {
	return (
		<div className="top-6 z-60 flex h-[calc(100%-1.5rem)] w-full flex-col gap-2 overflow-auto p-4">
			<div className="grid grid-cols-[auto_1fr] grid-rows-2 items-center gap-x-4">
				<UserAvatar className="row-span-2 h-13 w-13" />
				<div>{userStore.username}</div>
				<div>{userStore.user?.email}</div>
			</div>
			<Divider />
			<Button
				className="h-10"
				leftIcon={<IconUser className="h-6 w-6" />}
				navigateTo="/user-profile"
				variant="mobile"
			>
				Личные данные
				<IconForward className="ml-auto h-4 w-4" />
			</Button>
			<Button
				className="h-10"
				leftIcon={<IconShield className="h-6 w-6" />}
				navigateTo="/user-profile"
				variant="mobile"
			>
				Безопасность
				<IconForward className="ml-auto h-4 w-4" />
			</Button>
			<Button
				className="h-10"
				leftIcon={<IconNight className="h-6 w-6" />}
				navigateTo="/user-profile"
				variant="mobile"
			>
				Тема оформления
				<span className="ml-auto">{appStore.theme === 'dark' ? 'Темная' : 'Светлая'}</span>
				<IconForward className="ml-2 h-4 w-4" />
			</Button>
			<Button
				className="h-10"
				leftIcon={<IconLocation className="h-6 w-6" />}
				navigateTo="/user-profile"
				variant="mobile"
			>
				<span>{userProfileStore.profile?.location || 'Не указано'}</span>
				<IconForward className="ml-auto h-4 w-4" />
			</Button>
			<Button
				className="h-10 justify-start"
				leftIcon={<IconAgreement className="h-6 w-6" />}
				navigateTo="/terms"
				variant="mobile"
			>
				Пользовательское соглашение
				<IconForward className="ml-auto h-4 w-4" />
			</Button>
			<Button
				className="h-10 justify-start"
				leftIcon={<IconSecure className="h-6 w-6" />}
				navigateTo="/privacy"
				variant="mobile"
			>
				Политика конфиденциальности
				<IconForward className="ml-auto h-4 w-4" />
			</Button>
			<Button
				className="h-10 justify-start"
				leftIcon={<IconAbout className="h-6 w-6" />}
				navigateTo="/about"
				variant="mobile"
			>
				О проекте
				<IconForward className="ml-auto h-4 w-4" />
			</Button>
			<Divider />
			<Button
				className="h-10 justify-start"
				leftIcon={<IconLogout className="h-6 w-6" />}
				variant="mobile"
				onClick={onLogout}
			>
				Выйти
			</Button>
			<div className="hover:ring-1 focus:ring-1"></div>
		</div>
	);
};
export default MobileUserMenu;
