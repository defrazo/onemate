import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { IconClockEdit } from '@tabler/icons-react';
import { observer } from 'mobx-react-lite';

import { useStore } from '@/app/providers';
import { fullDate } from '@/shared/lib/utils';

import { CardActions } from '.';

export const Card = observer(({ id }: { id: string }) => {
	const { attributes, listeners, transform, transition, isDragging, setNodeRef } = useSortable({ id });

	const { notesStore } = useStore();

	const note = notesStore.draft.find((note) => note.id === id);
	if (!note) return null;

	return (
		<div
			ref={setNodeRef}
			className="core-border group/note flex min-h-24 shrink-0 bg-(--bg-secondary) py-2 pl-2"
			style={{ transform: CSS.Transform.toString(transform), transition, zIndex: isDragging ? 10 : 0 }}
		>
			<button
				className="flex min-w-0 flex-1 cursor-pointer flex-col pl-1 text-left"
				type="button"
				onClick={() => notesStore.openNote(id)}
			>
				<p className="line-clamp-3 text-sm">{note.text || 'Пустая заметка'}</p>
				<div className="mt-auto flex items-center gap-1 text-(--color-disabled)" title="Дата изменения">
					<IconClockEdit className="size-3" />
					<span className="trim text-xs">{fullDate(note.updated_at)}</span>
				</div>
			</button>
			<CardActions attributes={attributes} id={id} listeners={listeners} text={note.text} />
		</div>
	);
});
