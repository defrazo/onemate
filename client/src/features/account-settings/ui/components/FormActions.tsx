import { IconPointFilled } from '@tabler/icons-react';

import { Button } from '@/shared/ui';

interface FormActionsProps {
	isLoading?: boolean;
	onSave: () => void;
	onCancel: () => void;
	saveDisabled?: boolean;
}

export const FormActions = ({ isLoading = false, onSave, onCancel, saveDisabled = false }: FormActionsProps) => (
	<div className="core-gap mt-2 flex flex-1 flex-wrap items-center justify-end select-none">
		<div className="flex items-center gap-1">
			<IconPointFilled className="size-3.5 animate-pulse text-(--accent-secondary)" />
			<span className="trim text-sm text-(--text-disabled)">Изменения не сохранены</span>
		</div>
		<div className="core-gap flex h-8 not-md:mt-2 not-lg:flex-1">
			<Button
				className="not-lg:w-full lg:min-w-40"
				disabled={saveDisabled}
				loading={isLoading}
				loadingText="Сохранение..."
				variant="accent"
				onClick={onSave}
			>
				Сохранить
			</Button>
			<Button className="w-fit not-lg:w-full" disabled={isLoading} variant="danger" onClick={onCancel}>
				Отменить
			</Button>
		</div>
	</div>
);
