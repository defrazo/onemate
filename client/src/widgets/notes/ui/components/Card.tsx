import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { observer } from 'mobx-react-lite';

import { useStore } from '@/app/providers';

import { CardActions } from '.';

export const Card = observer(({ id }: { id: string }) => {
	const { attributes, listeners, transform, transition, isDragging, setNodeRef } = useSortable({ id });

	const { notesStore } = useStore();

	const note = notesStore.draft.find((note) => note.id === id);
	if (!note) return null;

	return (
		<div
			ref={setNodeRef}
			className="core-tone group/note flex min-h-18 shrink-0 snap-start rounded-lg py-2 pl-2 2xl:min-h-24"
			style={{ transform: CSS.Transform.toString(transform), transition, zIndex: isDragging ? 10 : 0 }}
		>
			<button
				className="flex min-w-0 flex-1 cursor-pointer flex-col pl-1 text-left"
				type="button"
				onClick={() => notesStore.openNote(id)}
			>
				<p className="line-clamp-3 text-sm text-(--text-primary) 2xl:line-clamp-4">
					{note.text || 'Пустая заметка'}
				</p>
			</button>
			<CardActions attributes={attributes} id={id} listeners={listeners} text={note.text} />
		</div>
	);
});
