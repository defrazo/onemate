import { HTMLAttributes } from 'react';
import { DraggableSyntheticListeners } from '@dnd-kit/core';
import { IconCopy, IconGripHorizontal, IconTrash } from '@tabler/icons-react';
import { observer } from 'mobx-react-lite';

import { useStore } from '@/app/providers';
import { useCopy } from '@/shared/lib/hooks';
import { Button, ConfirmDialog } from '@/shared/ui';

interface CardActionsProps {
	id: string;
	text: string;
	attributes: HTMLAttributes<HTMLElement>;
	listeners: DraggableSyntheticListeners;
}

export const CardActions = observer(({ id, text, attributes, listeners }: CardActionsProps) => {
	const copy = useCopy();

	const { modalStore, notesStore, notifyStore } = useStore();

	const removeNote = (id: string, onSuccess?: () => void) => {
		modalStore.setModal(
			<ConfirmDialog
				confirmLabel="Удалить"
				description="Это действие нельзя отменить."
				title="Удалить заметку?"
				variant="danger"
				onCancel={() => modalStore.closeModal()}
				onConfirm={() => {
					try {
						notesStore.removeNote(id);
						modalStore.closeModal();
						onSuccess?.();
					} catch {
						notifyStore.setNotice('Что-то пошло не так', 'error');
					}
				}}
			/>
		);
	};

	return (
		<div className="flex shrink-0 flex-col items-center justify-evenly xl:justify-between">
			<Button
				centerIcon={<IconGripHorizontal className="size-4 text-(--color-secondary)" />}
				className="hidden cursor-grab hover:text-(--accent-hover) xl:block"
				size="sm"
				title="Переместить"
				variant="mobile"
				{...listeners}
				{...attributes}
			/>
			<Button
				centerIcon={<IconCopy className="size-4" />}
				className="cursor-pointer transition-opacity hover:text-(--status-success) xl:opacity-0 xl:group-hover/note:opacity-100"
				size="sm"
				title="Скопировать"
				variant="mobile"
				onClick={() => {
					if (!text) {
						notifyStore.setNotice('Заметка пуста', 'info');
						return;
					}
					copy(text, 'Заметка скопирована!');
				}}
			/>
			<Button
				centerIcon={<IconTrash className="size-4" />}
				className="cursor-pointer transition-opacity hover:text-(--status-error) xl:opacity-0 xl:group-hover/note:opacity-100"
				size="sm"
				title="Удалить заметку"
				variant="mobile"
				onClick={() => removeNote(id)}
			/>
		</div>
	);
});
