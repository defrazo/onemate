import type { DraggableSyntheticListeners } from '@dnd-kit/core';
import { IconCopy, IconGripHorizontal, IconTrash } from '@tabler/icons-react';
import { observer } from 'mobx-react-lite';
import type { HTMLAttributes } from 'react';

import { useStore } from '@/app/providers';
import { COLOR_PALETTE, type PaletteColor } from '@/shared/config';
import { useCopy } from '@/shared/lib/hooks';
import { cn } from '@/shared/lib/utils';
import { Button, ConfirmDialog } from '@/shared/ui';

interface CardActionsProps {
	id: string;
	text: string;
	color: PaletteColor;
	attributes: HTMLAttributes<HTMLElement>;
	listeners: DraggableSyntheticListeners;
	sortingDisabled?: boolean;
}

export const CardActions = observer(({ id, text, color, attributes, listeners, sortingDisabled }: CardActionsProps) => {
	const copy = useCopy();

	const { modalStore, notesStore, notifyStore } = useStore();

	const removeNote = (id: string, onSuccess?: () => void) => {
		modalStore.setModal(
			<ConfirmDialog
				confirmLabel="Удалить"
				description="Это действие нельзя отменить"
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
		<div className="flex shrink-0 flex-col items-center justify-between gap-2 px-2">
			<div className="relative hidden size-5 shrink-0 items-center justify-center xl:flex">
				<span
					aria-hidden="true"
					className={cn(
						'h-1 w-3 rounded-full',
						!sortingDisabled && 'transition-opacity duration-200 group-hover/note:opacity-0'
					)}
					style={{ backgroundColor: COLOR_PALETTE[color].value }}
				/>
				{!sortingDisabled && (
					<Button
						centerIcon={<IconGripHorizontal className="size-4 text-(--text-secondary)" />}
						className="absolute cursor-grab opacity-0 transition-opacity duration-200 group-hover/note:opacity-100 active:cursor-grabbing"
						padding="none"
						title="Переместить"
						variant="icon"
						{...listeners}
						{...attributes}
					/>
				)}
			</div>
			<Button
				centerIcon={<IconCopy className="size-5 xl:size-4" />}
				className="transition-[color,opacity] xl:opacity-0 xl:group-hover/note:opacity-100"
				padding="none"
				title="Скопировать"
				variant="icon"
				onClick={() => {
					if (!text) {
						notifyStore.setNotice('Заметка пуста', 'info');
						return;
					}
					copy(text, 'Заметка скопирована');
				}}
			/>
			<Button
				centerIcon={<IconTrash className="size-5 xl:size-4" />}
				className="transition-[color,opacity] hover:text-(--status-error) xl:opacity-0 xl:group-hover/note:opacity-100"
				padding="none"
				title="Удалить заметку"
				variant="icon"
				onClick={() => removeNote(id)}
			/>
		</div>
	);
});
