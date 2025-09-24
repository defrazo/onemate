import { observer } from 'mobx-react-lite';

import { useStore } from '@/app/providers';
import NavigationLinks from '@/features/navigation';

const MobileTabBar = () => {
	const { userStore } = useStore();

	return (
		<div className="core-elements fixed bottom-0 left-0 z-50 flex h-12 w-full items-center justify-around border-t border-[var(--color-secondary)] shadow">
			<NavigationLinks
				className="no-touch-callout flex h-full w-full items-center justify-around"
				isAuth={Boolean(userStore.id)}
				variant="mobile"
			/>
		</div>
	);
};

export default observer(MobileTabBar);
