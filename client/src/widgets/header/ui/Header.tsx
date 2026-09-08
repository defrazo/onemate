import { useRef } from 'react';
import { observer } from 'mobx-react-lite';

import { useStore } from '@/app/providers';
import { Navbar } from '@/features/navigation';
import { ThemeSwitcher } from '@/features/theme-switcher';
import { LoginButton } from '@/features/user-auth';
import { useDeviceType, useOrientation } from '@/shared/lib/hooks';
import { DateTime, Logo } from '@/shared/ui';
import { UserMenuButton } from '@/widgets/user-menu';

export const Header = observer(() => {
	const device = useDeviceType();
	const orientation = useOrientation();

	const { authStore } = useStore();

	const headerRef = useRef<HTMLDivElement>(null);

	const isAuth = authStore.isReady;
	const showNavbar = device === 'desktop' || (device === 'tablet' && orientation === 'landscape');
	const showLogin = !isAuth && showNavbar;

	return (
		<header
			ref={headerRef}
			className="z-30 flex items-center justify-between rounded-xl bg-(--bg-tertiary) px-4 py-2 shadow-(--shadow) select-none md:py-2 print:hidden"
		>
			<Logo isLink size="lg" />

			{isAuth && showNavbar && <Navbar variant="desktop" />}

			<div className="flex items-center gap-4">
				{showLogin && <LoginButton />}
				{showLogin && <div className="h-7 w-px bg-(--border-alt)" />}

				{isAuth && <ThemeSwitcher />}

				{isAuth && <UserMenuButton headerRef={headerRef} />}
				{isAuth && <div className="h-7 w-px bg-(--border-alt)" />}

				<DateTime />

				{!isAuth && <ThemeSwitcher />}
			</div>
		</header>
	);
});
