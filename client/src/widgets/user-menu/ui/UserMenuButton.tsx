import { useState } from 'react';
import { IconChevronDown } from '@tabler/icons-react';

import { useStore } from '@/app/providers';
import { UserAvatar } from '@/entities/user-profile';
import { useEscapeClose, useOutsideClick, useResponsive } from '@/shared/lib/hooks';
import { cn } from '@/shared/lib/utils';
import { Button } from '@/shared/ui';

import { DesktopUserMenu, MobileUserMenu } from '.';

export const UserMenuButton = () => {
	const { isDesktop, isMobile, isTablet } = useResponsive();

	const { modalStore } = useStore();

	const [isOpen, setIsOpen] = useState(false);

	const menuRef = useOutsideClick<HTMLDivElement>(() => setIsOpen(false));

	useEscapeClose(() => setIsOpen(false));

	const handleUserMenuClick = () => {
		if (isMobile && !isTablet) {
			modalStore.setModal(<MobileUserMenu />, 'sheet');
			return;
		}

		setIsOpen((value) => !value);
	};

	return (
		<div ref={menuRef} className="relative">
			<Button
				active={!isMobile && isOpen}
				className="group md:landscape:core-tone-strong xl:core-tone-strong relative xl:px-2 xl:py-1 md:landscape:px-2 md:landscape:py-1"
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
				<UserAvatar className="size-10 xl:size-7 md:landscape:size-8 xl:landscape:size-7" />
			</Button>
			{(isDesktop || isTablet) && isOpen && <DesktopUserMenu onClose={() => setIsOpen(false)} />}
		</div>
	);
};
