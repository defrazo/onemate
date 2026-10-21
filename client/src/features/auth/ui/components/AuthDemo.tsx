import { observer } from 'mobx-react-lite';
import { useNavigate } from 'react-router-dom';

import { useStore } from '@/app/providers';
import { IconMask } from '@/shared/assets/icons';
import { Button, Tooltip } from '@/shared/ui';

export const AuthDemo = observer(() => {
	const navigate = useNavigate();

	const { authStore, notifyStore } = useStore();

	const handleDemo = async () => {
		try {
			await authStore.login('demo@example.com', 'DemoPassword123');

			navigate('/dashboard');
		} catch {
			notifyStore.setNotice('Что-то пошло не так', 'error');
		}
	};

	return (
		<Tooltip className="w-full" content="Запустить демо-режим">
			<Button
				className="h-8 w-full border border-(--tone-hover)"
				loading={authStore.isLoading}
				loadingText="Выполняется вход..."
				rightIcon={<IconMask className="size-4" />}
				variant="tone"
				onClick={handleDemo}
			>
				Войти как гость
			</Button>
		</Tooltip>
	);
});
