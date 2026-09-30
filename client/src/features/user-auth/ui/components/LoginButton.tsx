import { lazy, Suspense } from 'react';
import { IconLogin2 } from '@tabler/icons-react';
import { observer } from 'mobx-react-lite';

import { useStore } from '@/app/providers';
import { useDeviceType, useOrientation } from '@/shared/lib/hooks';
import { Button } from '@/shared/ui';

const UserAuth = lazy(() => import('../UserAuth').then(({ UserAuth }) => ({ default: UserAuth })));

export const LoginButton = observer(() => {
	const device = useDeviceType();
	const orientation = useOrientation();

	const { authFormStore, modalStore } = useStore();

	const isMobile = device === 'mobile' || (device === 'tablet' && orientation === 'portrait');

	const openAuth = () => {
		authFormStore.reset();
		authFormStore.switchToLogin();
		modalStore.setModal(
			<Suspense fallback={null}>
				<UserAuth />
			</Suspense>
		);
	};

	return (
		<Button
			className="font-bold text-(--color-primary) transition-colors hover:bg-(--accent-default)/12 hover:text-(--accent-default) lg:rounded-xl lg:bg-white/7"
			leftIcon={!isMobile && <IconLogin2 />}
			size={isMobile ? 'custom' : 'md'}
			variant="mobile"
			onClick={openAuth}
		>
			Войти
		</Button>
	);
});
