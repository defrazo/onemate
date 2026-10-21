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
		<div className="flex flex-col items-center justify-center gap-0.5 text-center">
			<div className="mb-1 flex size-16 items-center justify-center rounded-2xl bg-(--accent-primary-muted)">
				<IconCloudOff className="size-8 text-(--accent-primary)" stroke={1.8} />
			</div>
			<div className="flex flex-col">
				<span className="text-(--text-secondary)">{message || 'Не удалось загрузить данные'}</span>
				<span className="trim text-sm text-(--text-disabled)">Проверьте соединение и попробуйте снова</span>
			</div>
			<Button className="mt-3 h-7" onClick={onRetry}>
				Повторить
			</Button>
		</div>
	);
};
