import { IconWifiOff } from '@tabler/icons-react';

import { Button } from '../../../primitives/button/ui/Button';
import { LoadingState, type SpinnerSize } from './LoadingState';

interface LoadingErrorProps {
	error?: boolean | null;
	message?: string;
	size?: SpinnerSize;
	onRetry: () => void;
}

export const LoadingError = ({ error, message, size, onRetry }: LoadingErrorProps) => {
	if (!error) return <LoadingState size={size} />;

	return (
		<div className="flex h-full flex-1 flex-col items-center justify-center py-3 text-center">
			<div className="mb-3 flex size-13 shrink-0 items-center justify-center rounded-xl bg-(--status-error-muted)">
				<IconWifiOff className="size-6 text-(--status-error)" stroke={1.8} />
			</div>
			<span className="text-sm font-medium text-(--text-secondary)">
				{message || 'Не удалось загрузить данные'}
			</span>
			<span className="trim mt-1 rounded-md text-xs text-(--text-disabled)">
				Проверьте соединение и попробуйте снова
			</span>
			<Button className="mt-3 h-7 text-sm" onClick={onRetry}>
				Повторить
			</Button>
		</div>
	);
};
