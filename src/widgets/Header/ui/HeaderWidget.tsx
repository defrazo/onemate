import { useRef } from 'react';
import { observer } from 'mobx-react-lite';

import { userStore } from '@/entities/user';
import NavigationLinks from '@/features/navigation';
import ThemeSwitcher from '@/features/theme-switcher';
import { authStore } from '@/features/user-auth';
import { useIsMobile } from '@/shared/lib/hooks';
import { Time } from '@/shared/ui';
import { UserMenuButton } from '@/widgets/user-menu';

import { HeaderLogo } from '.';

const Header = () => {
	const isMobile = useIsMobile();
	const headerRef = useRef<HTMLDivElement>(null);

	return (
		<header
			ref={headerRef}
			className="core-card core-elements sticky z-10 my-2 flex justify-between px-4 py-3 select-none md:my-4 print:hidden"
		>
			<HeaderLogo />
			<div className="flex items-center gap-4">
				<div className="hidden md:flex">
					<NavigationLinks
						className="flex h-10 gap-4 font-bold"
						isAuth={userStore.isAuthenticated}
						variant="desktop"
					/>
				</div>

				{userStore.isAuthenticated && authStore.isAuthChecked && (
					<UserMenuButton headerRef={headerRef} isMobile={isMobile} />
				)}

				<Time />

				{!userStore.isAuthenticated && <ThemeSwitcher />}
			</div>
		</header>
	);
};

export default observer(Header);
