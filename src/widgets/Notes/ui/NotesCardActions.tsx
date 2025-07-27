import { DraggableSyntheticListeners } from '@dnd-kit/core';
import { observer } from 'mobx-react-lite';

import { IconCopy, IconMove, IconTrash } from '@/shared/assets/icons';
import { cn, copyExt } from '@/shared/lib/utils';
import { Button } from '@/shared/ui';

import { notesStore } from '../model';

interface NotesCardActionsProps {
	id: string;
	text: string;
	attributes: React.HTMLAttributes<HTMLElement>;
	listeners: DraggableSyntheticListeners;
}

export const NotesCardActions = observer(({ id, text, attributes, listeners }: NotesCardActionsProps) => {
	return (
		<div className="flex w-10 flex-col border-l border-[var(--border-color)]">
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
				onClick={() => copyExt(text, 'Заметка скопирована!')}
			/>
			<Button
				centerIcon={<IconTrash className="size-4" />}
				className="flex-1 hover:text-[var(--status-error)]"
				size="sm"
				title="Удалить заметку"
				variant="mobile"
				onClick={() => notesStore.removeNote(id)}
			/>
		</div>
	);
});
