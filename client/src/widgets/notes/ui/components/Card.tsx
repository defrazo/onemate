import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { observer } from 'mobx-react-lite';

import { useStore } from '@/app/providers';
import type { PaletteColor } from '@/shared/config';

import { CardActions } from './CardActions';

interface CardProps {
	id: string;
	color: PaletteColor;
	sortingDisabled?: boolean;
}

export const Card = observer(({ id, color, sortingDisabled = false }: CardProps) => {
	const { attributes, listeners, transform, transition, isDragging, setNodeRef } = useSortable({
		id,
		disabled: sortingDisabled,
	});

	const { notesStore } = useStore();

	const note = notesStore.draft.find((note) => note.id === id);
	if (!note) return null;

	return (
		<div
			ref={setNodeRef}
			className="core-tone group/note flex min-h-20 shrink-0 snap-start rounded-lg border border-(--border-contrast)/15 py-2 pl-2 xl:min-h-22 2xl:min-h-23.5"
			style={{ transform: CSS.Transform.toString(transform), transition, zIndex: isDragging ? 10 : 0 }}
		>
			<button
				className="flex min-w-0 flex-1 cursor-pointer flex-col text-left"
				type="button"
				onClick={() => notesStore.openNote(id)}
			>
				<p className="line-clamp-3 text-sm leading-4.5 whitespace-pre-wrap text-(--text-primary) xl:line-clamp-4">
					{note.text || 'Пустая заметка'}
				</p>
			</button>
			<CardActions
				attributes={attributes}
				color={color}
				id={id}
				listeners={listeners}
				sortingDisabled={sortingDisabled}
				text={note.text}
			/>
		</div>
	);
});
