import { IconLogin2 } from '@tabler/icons-react';
import { observer } from 'mobx-react-lite';

import { useStore } from '@/app/providers';
import { Button } from '@/shared/ui';

import { UserAuth } from '..';

export const LoginButton = observer(() => {
	const { authFormStore, modalStore } = useStore();

	const openAuth = () => {
		authFormStore.reset();
		authFormStore.switchToLogin();
		modalStore.setModal(<UserAuth />);
	};

	return (
		<Button
			className="font-bold text-(--color-primary) transition-colors hover:bg-(--accent-default)/12 hover:text-(--accent-default) lg:rounded-xl lg:bg-white/7"
			leftIcon={<IconLogin2 />}
			variant="mobile"
			onClick={openAuth}
		>
			Войти
		</Button>
	);
});
