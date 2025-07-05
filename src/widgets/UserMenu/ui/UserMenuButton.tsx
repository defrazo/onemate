import { useEffect } from 'react';

import UserAvatar from '@/features/user-avatar';
import { uiStore } from '@/shared/stores';
import { Button } from '@/shared/ui';

import { DesktopUserMenu, MobileUserMenu } from '.';

interface UserMenuButtonProps {
	isMobile: boolean;
	headerRef: React.RefObject<HTMLDivElement | null>;
}

export const UserMenuButton = ({ isMobile, headerRef }: UserMenuButtonProps) => {
	const isUserMenuOpen = () => uiStore.modalType === 'bottom-sheet' || uiStore.modalType === 'dropdown';

	const handleUserMenuClick = () => {
		const rect = headerRef.current?.getBoundingClientRect();

		if (!rect) return;

		if (isUserMenuOpen()) {
			uiStore.closeModal();
			return;
		}

		const position = {
			top: rect.bottom + window.scrollY - 10,
			left: rect.right + window.scrollX,
		};

		isMobile
			? uiStore.setModal(<MobileUserMenu />, 'bottom-sheet')
			: uiStore.setModal(<DesktopUserMenu />, 'dropdown', { position });
	};

	useEffect(() => {
		if (uiStore.modal && isUserMenuOpen()) {
			uiStore.closeModal();
			handleUserMenuClick();
		}
	}, [isMobile]);

	return (
		<Button
			centerIcon={<UserAvatar className="size-9 ring-[var(--accent-hover)] hover:ring-1" />}
			className="size-9"
			size="custom"
			variant="custom"
			onClick={handleUserMenuClick}
		/>
	);
};
