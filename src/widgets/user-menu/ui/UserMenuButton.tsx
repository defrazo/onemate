import { type RefObject, useEffect } from 'react';

import { useStore } from '@/app/providers';
import UserAvatar from '@/features/user-avatar';
import { Button } from '@/shared/ui';

import { DesktopUserMenu, MobileUserMenu } from '.';

interface UserMenuButtonProps {
	isMobile: boolean;
	headerRef: RefObject<HTMLDivElement | null>;
}

export const UserMenuButton = ({ isMobile, headerRef }: UserMenuButtonProps) => {
	const { modalStore } = useStore();

	const isUserMenuOpen = () => modalStore.modalType === 'sheet' || modalStore.modalType === 'dropdown';

	const handleUserMenuClick = () => {
		const rect = headerRef.current?.getBoundingClientRect();

		if (!rect) return;

		if (isUserMenuOpen()) {
			modalStore.closeModal();
			return;
		}

		const position = { top: rect.bottom + window.scrollY - 10, left: rect.right + window.scrollX };

		isMobile
			? modalStore.setModal(<MobileUserMenu />, 'sheet')
			: modalStore.setModal(<DesktopUserMenu />, 'dropdown', { position });
	};

	useEffect(() => {
		if (modalStore.modal && isUserMenuOpen()) {
			modalStore.closeModal();
			handleUserMenuClick();
		}
	}, [isMobile]);

	return (
		<Button
			centerIcon={<UserAvatar className="size-9 ring-[var(--accent-hover)] hover:ring-1" />}
			className="size-9"
			size="custom"
			title="Открыть меню пользователя"
			variant="custom"
			onClick={handleUserMenuClick}
		/>
	);
};
