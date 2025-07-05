import { DraggableSyntheticListeners } from '@dnd-kit/core';

import { IconCopy, IconMove, IconTrash } from '@/shared/assets/icons';
import { copyExt } from '@/shared/lib/utils';
import { Button } from '@/shared/ui';

interface NotesCardActionsProps {
	text: string;
	attributes: React.HTMLAttributes<HTMLElement>;
	listeners: DraggableSyntheticListeners;
	focused: boolean;
	onRemove: () => void;
}

export const NotesCardActions = ({ text, attributes, listeners, focused, onRemove }: NotesCardActionsProps) => {
	return (
		<div className="flex w-10 flex-col border-l border-[var(--border-color)]">
			<Button
				centerIcon={<IconMove className="size-4 rotate-90" />}
				className="flex-1 cursor-move hover:text-[var(--accent-hover)]"
				disabled={focused}
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
				onClick={onRemove}
			/>
		</div>
	);
};
