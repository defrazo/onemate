import { useRef } from 'react';
import { observer } from 'mobx-react-lite';

import { useStore } from '@/app/providers';
import NavigationLinks from '@/features/navigation';
import ThemeSwitcher from '@/features/theme-switcher';
import { useIsMobile } from '@/shared/lib/hooks';
import { Time } from '@/shared/ui';
import { UserMenuButton } from '@/widgets/user-menu';

import { HeaderLogo } from '.';

const Header = () => {
	const { authStore, userStore } = useStore();
	const isMobile = useIsMobile();
	const headerRef = useRef<HTMLDivElement>(null);

	return (
		<header
			ref={headerRef}
			className="core-card core-elements sticky z-10 flex justify-between px-4 py-3 select-none print:hidden"
		>
			<HeaderLogo />
			<div className="flex items-center gap-4">
				<div className="hidden lg:flex">
					<NavigationLinks
						className="flex h-10 gap-4 font-bold"
						isAuth={Boolean(userStore.id)}
						variant="desktop"
					/>
				</div>

				{userStore.id && authStore.isReady && <UserMenuButton headerRef={headerRef} isMobile={isMobile} />}

				<Time />

				{!userStore.id && <ThemeSwitcher />}
			</div>
		</header>
	);
};

export default observer(Header);
