import { useEffect, useRef } from 'react';
import { observer } from 'mobx-react-lite';

import { UserAvatar } from '@/entities/user';
import { authStore } from '@/features/auth';
import NavMenu from '@/features/navigation';
import ThemeSwitcher from '@/features/theme-switcher';
import { useIsMobile } from '@/shared/lib/hooks';
import { uiStore } from '@/shared/stores';
import { Button, Time } from '@/shared/ui';

import { DesktopUserMenu, HeaderLogo, MobileUserMenu } from '.';

const Header = () => {
	const isMobile = useIsMobile();
	const headerRef = useRef<HTMLDivElement>(null);

	const handleUserMenuClick = () => {
		if (!headerRef.current) return;

		const rect = headerRef.current.getBoundingClientRect();

		isMobile
			? uiStore.setModal(<MobileUserMenu />, 'bottom-sheet')
			: uiStore.setModal(<DesktopUserMenu />, 'dropdown', {
					position: {
						top: rect.bottom + window.scrollY - 10,
						left: rect.right + window.scrollX,
					},
				});
	};

	useEffect(() => {
		if (!uiStore.modal) return;

		const isUserMenuOpen = uiStore.modal.type === 'bottom-sheet' || uiStore.modal.type === 'dropdown';

		if (isUserMenuOpen) {
			uiStore.closeModal();
			handleUserMenuClick();
		}
	}, [isMobile]);

	return (
		<header
			ref={headerRef}
			className={
				'core-card core-elements sticky z-10 my-2 flex items-end justify-between px-4 py-3 select-none md:my-4'
			}
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
						centerIcon={<UserAvatar className="size-9 ring-[var(--accent-hover)] hover:ring-1" />}
						className="size-9"
						size="custom"
						variant="custom"
						onClick={handleUserMenuClick}
					/>
				)}

				<Time />

				{!authStore.isAuthenticated && <ThemeSwitcher />}
			</div>
		</header>
	);
};

export default observer(Header);
