import type { HTMLAttributes } from 'react';
import type { DraggableSyntheticListeners } from '@dnd-kit/core';
import { observer } from 'mobx-react-lite';

import { useStore } from '@/app/providers';
import { IconCopy, IconMove, IconTrash } from '@/shared/assets/icons';
import { useCopy } from '@/shared/lib/hooks';
import { cn } from '@/shared/lib/utils';
import { Button } from '@/shared/ui';

interface NotesCardActionsProps {
	id: string;
	text: string;
	attributes: HTMLAttributes<HTMLElement>;
	listeners: DraggableSyntheticListeners;
}

export const NotesCardActions = observer(({ id, text, attributes, listeners }: NotesCardActionsProps) => {
	const { notesStore, notifyStore } = useStore();
	const copy = useCopy();

	const handleRemove = (id: string) => {
		try {
			notesStore.removeNote(id);
		} catch (error: any) {
			notifyStore.setNotice(error.message, 'error');
		}
	};

	return (
		<div
			className={cn(
				'w-10 flex-col border-l border-[var(--border-color)]',
				notesStore.focusedId === id ? 'hidden' : 'flex'
			)}
		>
			<Button
				centerIcon={<IconMove className="size-4 rotate-90" />}
				className={cn(notesStore.focusedId && 'hidden', 'flex-1 cursor-move hover:text-[var(--accent-hover)]')}
				size="sm"
				title="Переместить"
				variant="mobile"
				{...listeners}
				{...attributes}
			/>
			<Button
				centerIcon={<IconCopy className="size-4" />}
				className="flex-1 cursor-copy hover:text-[var(--accent-hover)]"
				disabled={!text}
				size="sm"
				title="Скопировать"
				variant="mobile"
				onClick={() => copy(text, 'Заметка скопирована!')}
			/>
			<Button
				centerIcon={<IconTrash className="size-4" />}
				className="flex-1 hover:text-[var(--status-error)]"
				size="sm"
				title="Удалить заметку"
				variant="mobile"
				onClick={() => handleRemove(id)}
			/>
		</div>
	);
});
