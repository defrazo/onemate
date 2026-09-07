import { useRef } from 'react';
import { observer } from 'mobx-react-lite';

import { useStore } from '@/app/providers';
import { Navbar } from '@/features/navigation';
import { ThemeSwitcher } from '@/features/theme-switcher';
import { LoginButton } from '@/features/user-auth';
import { useDeviceType, useOrientation } from '@/shared/lib/hooks';
import { Logo, Time } from '@/shared/ui';
import { UserMenuButton } from '@/widgets/user-menu';

export const Header = observer(() => {
	const device = useDeviceType();
	const orientation = useOrientation();

	const { authStore } = useStore();

	const headerRef = useRef<HTMLDivElement>(null);
	const showNavbar = device === 'desktop' || (device === 'tablet' && orientation === 'landscape');

	return (
		<header
			ref={headerRef}
			className="z-30 flex justify-between rounded-xl bg-(--bg-tertiary) px-4 py-2 shadow-(--shadow) select-none md:py-3 print:hidden"
		>
			<Logo size="lg" />

			{authStore.isReady && showNavbar && <Navbar variant="desktop" />}

			<div className="flex items-center gap-4">
				{!authStore.isReady && showNavbar && <LoginButton />}
				{authStore.isReady && <UserMenuButton headerRef={headerRef} />}
				<Time />
				{!authStore.isReady && <ThemeSwitcher />}
			</div>
		</header>
	);
});
