import { useState } from 'react';
import { IconChevronDown } from '@tabler/icons-react';

import { useStore } from '@/app/providers';
import { UserAvatar } from '@/entities/user-profile';
import { useEscapeClose, useOutsideClick, useResponsive } from '@/shared/lib/hooks';
import { cn } from '@/shared/lib/utils';
import { Button } from '@/shared/ui';

import { DesktopUserMenu, MobileUserMenu } from '.';

export const UserMenuButton = () => {
	const { isMobile } = useResponsive();

	const { modalStore } = useStore();

	const [isOpen, setIsOpen] = useState(false);

	const menuRef = useOutsideClick<HTMLDivElement>(() => setIsOpen(false));

	useEscapeClose(() => setIsOpen(false));

	const handleUserMenuClick = () => {
		if (isMobile) {
			modalStore.setModal(<MobileUserMenu />, 'sheet');
			return;
		}

		setIsOpen((value) => !value);
	};

	return (
		<div ref={menuRef} className="relative">
			<Button
				active={!isMobile && isOpen}
				className="group xl:core-tone-strong relative xl:px-2 xl:py-1"
				padding="none"
				rightIcon={
					!isMobile && (
						<IconChevronDown
							className={cn(
								'size-4 text-(--text-secondary) transition-transform duration-300 group-hover:text-(--accent-primary)',
								isOpen ? 'rotate-180' : 'rotate-0'
							)}
						/>
					)
				}
				title="Открыть меню пользователя"
				variant="custom"
				onClick={handleUserMenuClick}
			>
				<UserAvatar className="size-7" />
			</Button>
			{!isMobile && isOpen && <DesktopUserMenu onClose={() => setIsOpen(false)} />}
		</div>
	);
};
