import { useNavigate } from 'react-router-dom';
import { observer } from 'mobx-react-lite';

import { useStore } from '@/app/providers';
import { IconMask } from '@/shared/assets/icons';
import { Button, Tooltip } from '@/shared/ui';

export const AuthDemo = observer(() => {
	const navigate = useNavigate();

	const { authStore, notifyStore } = useStore();

	const handleDemo = async () => {
		try {
			await authStore.login('demo@example.com', 'DemoPassword123');

			navigate('/');
		} catch {
			notifyStore.setNotice('Что-то пошло не так', 'error');
		}
	};

	return (
		<Tooltip className="w-full" content="Запустить демо-режим">
			<Button
				className="flex h-10 w-full gap-2 text-sm hover:text-(--accent-text) hover:opacity-100 md:text-base"
				loading={authStore.isLoading}
				onClick={handleDemo}
			>
				Войти как гость <IconMask className="size-5" />
			</Button>
		</Tooltip>
	);
});
