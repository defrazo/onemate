import { IconCheck, IconX } from '@tabler/icons-react';

import { cn } from '@/shared/lib/utils';
import { Button } from '@/shared/ui';

interface ConfirmActionsProps {
	confirmLabel?: string;
	cancelLabel?: string;
	disabled?: boolean;
	confirmDisabled?: boolean;
	cancelDisabled?: boolean;
	loading?: boolean;
	size?: 'sm' | 'md';
	className?: string;
	onConfirm: () => void;
	onCancel: () => void;
}

export const ConfirmActions = ({
	confirmLabel = 'Подтвердить',
	cancelLabel = 'Отменить',
	disabled = false,
	confirmDisabled = false,
	cancelDisabled = false,
	loading = false,
	size = 'md',
	className,
	onConfirm,
	onCancel,
}: ConfirmActionsProps) => {
	const isDisabled = disabled || loading;

	return (
		<div className={cn('flex shrink-0 items-center gap-2', className)}>
			<Button
				aria-label={confirmLabel}
				centerIcon={<IconCheck className={cn(size === 'sm' ? 'size-3.5' : 'size-4')} />}
				disabled={isDisabled || confirmDisabled}
				padding="none"
				title={confirmLabel}
				variant="icon"
				onClick={onConfirm}
			/>
			<Button
				aria-label={cancelLabel}
				centerIcon={<IconX className={cn(size === 'sm' ? 'size-3.5' : 'size-4')} />}
				disabled={isDisabled || cancelDisabled}
				padding="none"
				title={cancelLabel}
				variant="icon"
				onClick={onCancel}
			/>
		</div>
	);
};
