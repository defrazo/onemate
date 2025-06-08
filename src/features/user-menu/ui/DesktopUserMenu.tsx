import { useRef } from 'react';

import { UserAvatar, userStore } from '@/entities/user';
import { IconLock, IconLogout, IconUser } from '@/shared/assets/icons';
import { Button, Divider } from '@/shared/ui';

interface DesktopUserMenuProps {
	isUserMenuOpen?: boolean;
	onLogout: () => void;
	onClose?: () => void;
}

const DesktopUserMenu = ({ isUserMenuOpen, onLogout, onClose }: DesktopUserMenuProps) => {
	const overlayRef = useRef<HTMLDivElement>(null);

	return (
		<>
			{isUserMenuOpen && (
				<div ref={overlayRef} className="fixed inset-0 z-0 bg-black/40 opacity-50" onClick={onClose} />
			)}
			<div className="core-card core-elements absolute top-full right-0 z-10 flex size-fit flex-col gap-2 rounded-t-none border-1 border-[var(--border-color)]">
				<div className="grid grid-cols-[auto_1fr] grid-rows-2 items-center gap-x-4">
					<UserAvatar className="row-span-2 h-13 w-13" />
					<div>{userStore.username}</div>
					<div>{userStore.user?.email}</div>
				</div>
				<Divider />
				<Button
					className="h-10 justify-start"
					leftIcon={<IconUser className="h-6 w-6" />}
					navigateTo="/user-profile"
					onClick={onClose}
				>
					Личные данные
				</Button>
				<Button
					className="h-10 justify-start"
					leftIcon={<IconLock className="h-6 w-6" />}
					navigateTo="/user-profile"
				>
					Безопасность
				</Button>
				<Divider />
				<Button className="h-10 justify-start" leftIcon={<IconLogout className="h-6 w-6" />} onClick={onLogout}>
					Выйти
				</Button>
			</div>
		</>
	);
};

export default DesktopUserMenu;
