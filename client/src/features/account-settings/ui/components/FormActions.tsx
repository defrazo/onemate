import { IconCircleFilled } from '@tabler/icons-react';

import { Button } from '@/shared/ui';

interface FormActionsProps {
	isLoading?: boolean;
	onSave: () => void;
	onCancel: () => void;
	saveDisabled?: boolean;
}

export const FormActions = ({ isLoading = false, onSave, onCancel, saveDisabled = false }: FormActionsProps) => (
	<div className="mt-2 flex flex-1 flex-wrap items-center justify-between gap-4">
		<div className="flex items-center gap-2 text-sm text-(--color-secondary) opacity-60">
			<IconCircleFilled className="size-2 animate-pulse text-(--color-accent)" />
			<span>Изменения не сохранены</span>
		</div>
		<div className="flex h-8 flex-1 gap-3">
			<Button
				className="flex-1"
				disabled={saveDisabled}
				loading={isLoading}
				loadingText="Сохранение..."
				variant="accent"
				onClick={onSave}
			>
				Сохранить
			</Button>
			<Button className="flex-1" loading={true} variant="warning" onClick={onCancel}>
				Отменить
			</Button>
		</div>
	</div>
);
