import { IconCircleFilled } from '@tabler/icons-react';

import { Button } from '@/shared/ui';

interface FormActionsProps {
	isLoading?: boolean;
	onSave: () => void;
	onCancel: () => void;
	saveDisabled?: boolean;
}

export const FormActions = ({ isLoading = false, onSave, onCancel, saveDisabled = false }: FormActionsProps) => (
	<div className="mt-2 flex items-center justify-between gap-4">
		<div className="flex items-center gap-2 text-sm text-(--color-secondary) opacity-60">
			<IconCircleFilled className="size-2 animate-pulse text-(--color-accent)" />
			<span>Изменения не сохранены</span>
		</div>
		<div className="flex h-8 gap-3">
			<Button className="w-28" disabled={saveDisabled} loading={isLoading} variant="accent" onClick={onSave}>
				Сохранить
			</Button>
			<Button variant="warning" onClick={onCancel}>
				Отменить
			</Button>
		</div>
	</div>
);
