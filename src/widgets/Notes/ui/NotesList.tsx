import { ReactElement } from 'react';
import { closestCenter, DndContext, DragEndEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { restrictToParentElement } from '@dnd-kit/modifiers';
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { observer } from 'mobx-react-lite';

import type { Note } from '../model';
import { notesStore } from '../model';

interface NotesListProps {
	children: (note: Note, index: number) => ReactElement;
}

export const NotesList = observer(({ children }: NotesListProps) => {
	const sensors = useSensors(useSensor(PointerSensor));

	const store = notesStore;

	const visibleNotes = store.focusedId ? store.notes.filter((note) => note.id === store.focusedId) : store.notes;

	const handleDragEnd = (event: DragEndEvent) => {
		const { active, over } = event;

		if (active.id !== over?.id) {
			const oldIndex = store.notes.findIndex((n) => n.id === active.id);
			const newIndex = store.notes.findIndex((n) => n.id === over?.id);
			const newNotes = arrayMove(store.notes, oldIndex, newIndex);

			store.updateOrder(newNotes);
		}
	};

	return (
		<DndContext
			collisionDetection={closestCenter}
			modifiers={[restrictToParentElement]}
			sensors={sensors}
			onDragEnd={handleDragEnd}
		>
			<SortableContext items={store.notes.map((n) => n.id)} strategy={verticalListSortingStrategy}>
				<div className="hide-scrollbar flex h-full max-h-[18.6rem] flex-col gap-2 overflow-y-auto overscroll-contain">
					{visibleNotes.map((note, idx) => children(note, idx))}
				</div>
			</SortableContext>
		</DndContext>
	);
});
