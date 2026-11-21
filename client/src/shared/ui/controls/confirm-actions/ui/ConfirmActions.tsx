import { IconCheck, IconX } from '@tabler/icons-react';

import { cn } from '@/shared/lib/utils';

import { Button } from '../../../primitives/button/ui/Button';

interface ConfirmActionsProps {
	confirmLabel?: string;
	cancelLabel?: string;
	disabled?: boolean;
	confirmDisabled?: boolean;
	cancelDisabled?: boolean;
	loading?: boolean;
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
	className,
	onConfirm,
	onCancel,
}: ConfirmActionsProps) => {
	const isDisabled = disabled || loading;

	return (
		<div className={cn('flex shrink-0 items-center gap-3 xl:gap-2', className)}>
			<Button
				aria-label={confirmLabel}
				centerIcon={<IconCheck className="size-6 md:size-5 xl:size-4" />}
				disabled={isDisabled || confirmDisabled}
				padding="none"
				title={confirmLabel}
				variant="icon"
				onClick={onConfirm}
			/>
			<Button
				aria-label={cancelLabel}
				centerIcon={<IconX className="size-6 md:size-5 xl:size-4" />}
				disabled={isDisabled || cancelDisabled}
				padding="none"
				title={cancelLabel}
				variant="icon"
				onClick={onCancel}
			/>
		</div>
	);
};
