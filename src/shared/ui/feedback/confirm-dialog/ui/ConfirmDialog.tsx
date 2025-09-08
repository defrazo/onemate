import { IconWarning } from '@/shared/assets/icons';
import { Button } from '@/shared/ui';

interface ConfirmDialogProps {
	title: string;
	description?: string;
	confirmLabel?: string;
	cancelLabel?: string;
	onConfirm: (confirm: boolean) => void;
}

const ConfirmDialog = ({
	title = 'Вы уверены?',
	description,
	confirmLabel = 'Подтвердить',
	cancelLabel = 'Отмена',
	onConfirm,
}: ConfirmDialogProps) => {
	return (
		<div className="flex flex-col items-center gap-4 px-4 pb-4 md:w-lg md:p-0">
			<div className="flex flex-col items-center gap-2 text-center select-none">
				<IconWarning className="size-20 text-[var(--warning-default)]" />
				<h1 className="text-2xl font-bold">{title}</h1>
				<p className="text-sm text-[var(--color-disabled)]">{description}</p>
			</div>
			<div className="flex w-full gap-2" onClick={() => onConfirm(true)}>
				<Button className="w-full" type="submit">
					{confirmLabel}
				</Button>
				<Button className="w-full" type="submit" onClick={() => onConfirm(false)}>
					{cancelLabel}
				</Button>
			</div>
		</div>
	);
};

export default ConfirmDialog;
