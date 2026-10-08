import { IconLogin2 } from '@tabler/icons-react';
import { observer } from 'mobx-react-lite';

import { useStore } from '@/app/providers';
import { useResponsive } from '@/shared/lib/hooks';
import { Button } from '@/shared/ui';

import { UserAuth } from '..';

export const LoginButton = observer(() => {
	const { isMobile } = useResponsive();

	const { authFormStore, modalStore } = useStore();

	const openAuth = () => {
		authFormStore.reset();
		authFormStore.switchToLogin();
		modalStore.setModal(<UserAuth />);
	};

	return (
		<Button
			className="font-semibold lg:bg-(--tone-strong) lg:hover:bg-(--tone-strong-hover)"
			leftIcon={!isMobile && <IconLogin2 />}
			variant="tone"
			onClick={openAuth}
		>
			Войти
		</Button>
	);
});
