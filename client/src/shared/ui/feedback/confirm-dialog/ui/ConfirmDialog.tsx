import { IconAlertTriangle } from '@tabler/icons-react';

import { cn } from '@/shared/lib/utils';
import { Button } from '@/shared/ui';

interface ConfirmDialogProps {
	title: string;
	description?: string;
	confirmLabel?: string;
	cancelLabel?: string;
	variant?: 'default' | 'danger';
	onConfirm: () => void;
	onCancel: () => void;
}

export const ConfirmDialog = ({
	title,
	description,
	confirmLabel = 'Подтвердить',
	cancelLabel = 'Отмена',
	variant = 'default',
	onConfirm,
	onCancel,
}: ConfirmDialogProps) => (
	<div className="-mt-4 flex w-sm flex-col gap-4 select-none">
		<div className="flex gap-2">
			<div
				className={cn(
					'flex size-11 shrink-0 items-center justify-center rounded-xl bg-(--accent-default)/12',
					variant === 'danger'
						? 'bg-(--status-error)/10 text-(--status-error)'
						: 'bg-(--warning-default)/10 text-(--warning-default)'
				)}
			>
				<IconAlertTriangle className="size-5.5" />
			</div>
			<div className="flex h-full flex-col justify-between gap-0.5 select-none">
				<h2 className="text-xl font-semibold">{title}</h2>
				<p className="trim text-sm text-(--color-secondary) opacity-60">Подтвердите действие</p>
			</div>
		</div>
		<p className="trim text-sm text-(--color-secondary) opacity-80">{description}</p>
		<div className="flex h-8 justify-end gap-3">
			<Button variant="accent" onClick={onConfirm}>
				{confirmLabel}
			</Button>
			<Button variant="warning" onClick={onCancel}>
				{cancelLabel}
			</Button>
		</div>
	</div>
);
