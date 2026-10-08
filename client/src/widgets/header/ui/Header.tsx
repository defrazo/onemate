import { observer } from 'mobx-react-lite';

import { useStore } from '@/app/providers';
import { Navbar } from '@/features/navigation';
import { NotificationButton } from '@/features/notifications';
import { ThemeSwitcher } from '@/features/theme-switcher';
import { LoginButton } from '@/features/user-auth';
import { useResponsive } from '@/shared/lib/hooks';
import { DateTime, Logo } from '@/shared/ui';
import { UserMenuButton } from '@/widgets/user-menu';

export const Header = observer(() => {
	const { isMobile } = useResponsive();

	const { authStore } = useStore();

	const isAuth = authStore.isReady;

	return (
		<header className="z-30 flex items-center justify-between border-b border-(--border-tone) px-4 pb-3 select-none print:hidden">
			<Logo isLink size="lg" />
			{isAuth && !isMobile && <Navbar variant="desktop" />}
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
						<div className="h-7 w-px bg-(--border-tone)/70" />
						<DateTime />
					</>
				)}
			</div>
		</header>
	);
});
