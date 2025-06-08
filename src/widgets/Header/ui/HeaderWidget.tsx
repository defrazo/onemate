import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { observer } from 'mobx-react-lite';

import { UserAvatar } from '@/entities/user';
import { authStore } from '@/features/auth';
import NavMenu from '@/features/navigation';
import ThemeSwitcher from '@/features/theme-switcher';
import { DesktopUserMenu, MobileUserMenu } from '@/features/user-menu';
import { useIsMobile } from '@/shared/lib/hooks';
import { storage } from '@/shared/lib/storage/localStorage';
import { cn } from '@/shared/lib/utils';
import { appStore } from '@/shared/store/appStore';
import { Button, Time } from '@/shared/ui';

import { HeaderLogo } from '.';

const Header = () => {
	const isMobile = useIsMobile();
	const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
	const navigate = useNavigate();

	const closeUserMenu = () => {
		setIsUserMenuOpen(false);
		if (storage.get('savedTab') !== '') storage.set('savedTab', 'profile');
	};

	const handleUserMenuClick = () => {
		isMobile ? appStore.setModal(<MobileUserMenu onLogout={handleLogout} />) : setIsUserMenuOpen(true);
	};

	const handleLogout = async () => {
		await authStore.logout();
		isMobile ? appStore.closeModal() : setIsUserMenuOpen(false);
		queueMicrotask(() => navigate('/'));
	};

	return (
		<header
			className={cn(
				'core-card core-elements sticky z-10 my-2 flex items-end justify-between px-4 py-3 md:my-4',
				isUserMenuOpen && 'rounded-br-none'
			)}
		>
			<HeaderLogo />
			<div className="flex items-center gap-4">
				<div className="hidden md:flex">
					<NavMenu
						className="flex h-10 gap-4 font-bold"
						isAuth={authStore.isAuthenticated}
						variant="desktop"
					/>
				</div>

				{authStore.isAuthenticated && authStore.isAuthChecked && (
					<Button
						centerIcon={<UserAvatar className="h-9 ring-[var(--accent-hover)] hover:ring-1" />}
						className="h-9"
						size="custom"
						variant="rounded"
						onClick={handleUserMenuClick}
					/>
				)}

				<Time />
				<ThemeSwitcher />
			</div>

			{isUserMenuOpen && (
				<DesktopUserMenu isUserMenuOpen={isUserMenuOpen} onClose={closeUserMenu} onLogout={handleLogout} />
			)}
		</header>
	);
};

export default observer(Header);
