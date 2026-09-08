import { useEffect, useState } from 'react';
import { IconCloudOff } from '@tabler/icons-react';

import { Button } from '@/shared/ui';

import { LoadingState, type SpinnerSize } from '.';

interface LoadingErrorProps {
	message?: string;
	size?: SpinnerSize;
	onRetry: () => void;
}

export const LoadingError = ({ message, size, onRetry }: LoadingErrorProps) => {
	const [failed, setFailed] = useState(false);

	useEffect(() => {
		const timer = setTimeout(() => setFailed(true), 10000);
		return () => clearTimeout(timer);
	}, []);

	if (!failed) return <LoadingState size={size} />;

	return (
		<div className="flex flex-col items-center justify-center gap-3 text-center">
			<div className="flex size-16 items-center justify-center rounded-2xl bg-(--accent-default)/10">
				<IconCloudOff className="size-8 text-(--accent-default)" stroke={1.8} />
			</div>
			<div className="flex flex-col">
				<span className="font-medium text-(--color-primary)">{message || 'Не удалось загрузить данные'}</span>
				<span className="text-sm text-(--color-secondary)">Проверьте соединение и попробуйте снова</span>
			</div>
			<Button className="h-8 px-5" onClick={onRetry}>
				Повторить
			</Button>
		</div>
	);
};
