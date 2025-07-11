import { observer } from 'mobx-react-lite';

import NavigationLinks from '@/features/navigation';
import { authStore } from '@/features/user-auth';

const MobileTabBar = () => {
	return (
		<div className="core-elements fixed bottom-0 left-0 z-50 flex h-16 w-full items-center justify-around border-t-1 border-[var(--color-primary)] shadow">
			<NavigationLinks
				className="flex h-full w-full items-center justify-around"
				isAuth={authStore.isAuthenticated}
				variant="mobile"
			/>
		</div>
	);
};

export default observer(MobileTabBar);
