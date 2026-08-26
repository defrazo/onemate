import { type RefObject, useEffect } from 'react';

import { useStore } from '@/app/providers';
import UserAvatar from '@/features/user-avatar';
import { useDeviceType, useOrientation } from '@/shared/lib/hooks';
import { Button } from '@/shared/ui';

import { DesktopUserMenu, MobileUserMenu } from '.';

interface UserMenuButtonProps {
	headerRef: RefObject<HTMLDivElement | null>;
}

export const UserMenuButton = ({ headerRef }: UserMenuButtonProps) => {
	const { modalStore } = useStore();

	const device = useDeviceType();
	const orientation = useOrientation();

	const isUserMenuOpen = () => modalStore.modalType === 'sheet' || modalStore.modalType === 'dropdown';

	const handleUserMenuClick = () => {
		const rect = headerRef.current?.getBoundingClientRect();

		if (!rect) return;

		if (isUserMenuOpen()) {
			modalStore.closeModal();
			return;
		}

		const position = { top: rect.bottom + window.scrollY - 10, left: rect.right + window.scrollX };

		device === 'mobile' || (device === 'tablet' && orientation === 'portrait')
			? modalStore.setModal(<MobileUserMenu />, 'sheet')
			: modalStore.setModal(<DesktopUserMenu />, 'dropdown', { position });
	};

	useEffect(() => {
		if (modalStore.modal && isUserMenuOpen()) {
			modalStore.closeModal();
			handleUserMenuClick();
		}
	}, [device]);

	return (
		<Button
			centerIcon={<UserAvatar className="size-10 ring-(--accent-hover) hover:ring-2" />}
			size="custom"
			title="Открыть меню пользователя"
			variant="custom"
			onClick={handleUserMenuClick}
		/>
	);
};
