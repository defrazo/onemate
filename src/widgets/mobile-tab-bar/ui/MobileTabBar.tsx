import { observer } from 'mobx-react-lite';

import { userStore } from '@/entities/user';
import NavigationLinks from '@/features/navigation';

const MobileTabBar = () => {
	return (
		<div className="core-elements fixed bottom-0 left-0 z-50 flex h-16 w-full items-center justify-around border-t-1 border-[var(--color-primary)] shadow">
			<NavigationLinks
				className="flex h-full w-full items-center justify-around"
				isAuth={userStore.isAuthenticated}
				variant="mobile"
			/>
		</div>
	);
};

export default observer(MobileTabBar);
