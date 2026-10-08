import { IconCircleFilled } from '@tabler/icons-react';

import { Button } from '@/shared/ui';

interface FormActionsProps {
	isLoading?: boolean;
	onSave: () => void;
	onCancel: () => void;
	saveDisabled?: boolean;
}

export const FormActions = ({ isLoading = false, onSave, onCancel, saveDisabled = false }: FormActionsProps) => (
	<div className="core-gap mt-2 flex flex-1 flex-wrap items-center justify-between">
		<div className="flex items-center gap-2 text-sm text-(--text-secondary) opacity-60 select-none">
			<IconCircleFilled className="size-2 animate-pulse text-(--accent-secondary)" />
			<span className="trim">Изменения не сохранены</span>
		</div>
		<div className="core-gap ml-auto flex h-8">
			<Button
				className="min-w-40"
				disabled={saveDisabled}
				loading={isLoading}
				loadingText="Сохранение..."
				variant="accent"
				onClick={onSave}
			>
				Сохранить
			</Button>
			<Button className="w-fit" disabled={isLoading} variant="danger" onClick={onCancel}>
				Отменить
			</Button>
		</div>
	</div>
);
