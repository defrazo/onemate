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
	<div className="core-gap flex flex-col select-none md:-mt-4 md:w-sm">
		<div className="flex gap-2">
			<div
				className={cn(
					'flex size-11 shrink-0 items-center justify-center rounded-xl bg-(--accent-primary)/12',
					variant === 'danger'
						? 'bg-(--status-error-muted) text-(--status-error)'
						: 'bg-(--danger)/10 text-(--danger)'
				)}
			>
				<IconAlertTriangle className="size-5.5" />
			</div>
			<div className="flex h-full flex-col justify-between gap-0.5 select-none">
				<h2 className="text-lg font-semibold lg:text-xl">{title}</h2>
				<p className="trim text-sm text-(--text-secondary) opacity-60">Подтвердите действие</p>
			</div>
		</div>
		<p className="trim text-sm text-(--text-secondary) opacity-80 not-md:py-4">{description}</p>
		<div className="flex h-9 justify-center gap-3 md:h-7 md:justify-end">
			<Button className="not-md:flex-1" variant="accent" onClick={onConfirm}>
				{confirmLabel}
			</Button>
			<Button className="not-md:flex-1" variant="danger" onClick={onCancel}>
				{cancelLabel}
			</Button>
		</div>
	</div>
);
