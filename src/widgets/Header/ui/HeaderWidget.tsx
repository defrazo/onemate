import { useRef } from 'react';
import { observer } from 'mobx-react-lite';

import { useStore } from '@/app/providers';
import NavigationLinks from '@/features/navigation';
import ThemeSwitcher from '@/features/theme-switcher';
import { Time } from '@/shared/ui';
import { UserMenuButton } from '@/widgets/user-menu';

import { HeaderLogo } from '.';
import { useDeviceType, useOrientation } from '@/shared/lib/hooks';

const Header = () => {
	const { authStore, userStore } = useStore();
	const device = useDeviceType();
	const orientation = useOrientation();

	const headerRef = useRef<HTMLDivElement>(null);
	const showNavBar = device === 'desktop' || (device === 'tablet' && orientation === 'landscape');

	return (
		<header
			ref={headerRef}
			className="core-elements z-30 flex justify-between rounded-xl px-4 py-2 select-none md:py-3 print:hidden"
		>
			<HeaderLogo />
			<div className="flex items-center gap-4">
				<div className={`${showNavBar ? 'flex' : 'hidden'}`}>
					<NavigationLinks
						className="flex h-10 gap-4 font-bold"
						isAuth={Boolean(userStore.id)}
						variant="desktop"
					/>
				</div>
				{userStore.id && authStore.isReady && <UserMenuButton headerRef={headerRef} />}
				<Time />
				{!userStore.id && <ThemeSwitcher />}
			</div>
		</header>
	);
};

export default observer(Header);
