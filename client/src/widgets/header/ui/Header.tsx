import { observer } from 'mobx-react-lite';

import { useStore } from '@/app/providers';
import { LoginButton } from '@/features/auth';
import { Navbar } from '@/features/navigation';
import { NotificationButton } from '@/features/notifications';
import { ThemeSwitcher } from '@/features/theme-switcher';
import { useResponsive } from '@/shared/lib/hooks';
import { DateTime, Divider, Logo } from '@/shared/ui';
import { UserMenuButton } from '@/widgets/user-menu';

export const Header = observer(() => {
	const { isMobile, isTablet } = useResponsive();

	const { authStore } = useStore();

	const isAuth = authStore.isReady;

	return (
		<header className="z-30 flex items-center justify-between border-b border-(--border-tone) pb-2 select-none lg:px-4 lg:pb-3 print:hidden">
			<Logo isLink size="lg" />
			{isAuth && (!isMobile || isTablet) && <Navbar variant="desktop" />}
			<div className="core-gap flex items-center">
				{!isAuth ? (
					<>
						<ThemeSwitcher />
						<LoginButton />
					</>
				) : (
					<>
						<NotificationButton />
						<UserMenuButton />
					</>
				)}
				{!isMobile && (
					<>
						<Divider direction="Y" />
						<DateTime />
					</>
				)}
			</div>
		</header>
	);
});
