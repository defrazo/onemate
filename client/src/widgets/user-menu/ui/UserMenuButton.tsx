import { type RefObject, useCallback, useEffect } from 'react';
import { IconChevronDown } from '@tabler/icons-react';

import { useStore } from '@/app/providers';
import { UserAvatar } from '@/entities/user-profile';
import { useDeviceType, useOrientation } from '@/shared/lib/hooks';
import { Button } from '@/shared/ui';

import { DesktopUserMenu, MobileUserMenu } from '.';

export const UserMenuButton = ({ headerRef }: { headerRef: RefObject<HTMLDivElement | null> }) => {
	const device = useDeviceType();
	const orientation = useOrientation();

	const { modalStore } = useStore();

	const isMobile = device === 'mobile' || (device === 'tablet' && orientation === 'portrait');

	const isUserMenuOpen = useCallback(
		() => modalStore.modalType === 'sheet' || modalStore.modalType === 'dropdown',
		[modalStore]
	);

	const handleUserMenuClick = useCallback(() => {
		const rect = headerRef.current?.getBoundingClientRect();

		if (!rect) return;

		if (isUserMenuOpen()) {
			modalStore.closeModal();
			return;
		}

		const position = { top: rect.bottom + window.scrollY - 7, left: rect.right + window.scrollX };

		isMobile
			? modalStore.setModal(<MobileUserMenu />, 'sheet')
			: modalStore.setModal(<DesktopUserMenu />, 'dropdown', { position });
	}, [headerRef, isMobile, isUserMenuOpen, modalStore]);

	useEffect(() => {
		if (modalStore.modal && isUserMenuOpen()) {
			modalStore.closeModal();
			handleUserMenuClick();
		}
	}, [device, orientation, modalStore, isUserMenuOpen, handleUserMenuClick]);

	return (
		<Button
			className="group xl:rounded-xl xl:bg-white/4 xl:px-2 xl:py-1 xl:transition-colors xl:hover:bg-white/8"
			rightIcon={
				!isMobile && (
					<IconChevronDown className="size-4 text-(--text-secondary) transition-colors group-hover:text-(--accent-primary)" />
				)
			}
			size="custom"
			title="Открыть меню пользователя"
			variant="custom"
			onClick={handleUserMenuClick}
		>
			<UserAvatar className="size-8" />
		</Button>
	);
};
