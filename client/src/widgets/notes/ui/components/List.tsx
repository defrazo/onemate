import type { ReactElement } from 'react';
import { closestCenter, DndContext, type DragEndEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { restrictToParentElement } from '@dnd-kit/modifiers';
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { observer } from 'mobx-react-lite';

import { useStore } from '@/app/providers';

import type { Note } from '../../model';

export const List = observer(({ children }: { children: (note: Note) => ReactElement }) => {
	const sensors = useSensors(useSensor(PointerSensor));

	const { notesStore } = useStore();

	const handleDragEnd = ({ active, over }: DragEndEvent) => {
		if (!over || active.id === over.id) return;

		const oldIndex = notesStore.draft.findIndex((note) => note.id === active.id);
		const newIndex = notesStore.draft.findIndex((note) => note.id === over.id);

		if (oldIndex === -1 || newIndex === -1) return;

		notesStore.updateOrder(arrayMove(notesStore.draft, oldIndex, newIndex));
	};

	return (
		<DndContext
			collisionDetection={closestCenter}
			modifiers={[restrictToParentElement]}
			sensors={sensors}
			onDragEnd={handleDragEnd}
		>
			<SortableContext items={notesStore.draft.map((note) => note.id)} strategy={verticalListSortingStrategy}>
				<div className="hide-scrollbar flex max-h-[60svh] min-h-0 flex-col gap-2 overflow-y-auto md:flex md:max-h-[40svh]">
					{notesStore.draft.map((note) => children(note))}
				</div>
			</SortableContext>
		</DndContext>
	);
});
