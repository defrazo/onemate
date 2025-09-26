import type { ReactElement } from 'react';
import { closestCenter, DndContext, type DragEndEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { restrictToParentElement } from '@dnd-kit/modifiers';
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { observer } from 'mobx-react-lite';

import { useStore } from '@/app/providers';
import { useOrientation } from '@/shared/lib/hooks';
import { cn } from '@/shared/lib/utils';

import type { Note } from '../model';

interface NotesListProps {
	children: (note: Note, index: number) => ReactElement;
}

export const NotesList = observer(({ children }: NotesListProps) => {
	const { notesStore: store } = useStore();
	const sensors = useSensors(useSensor(PointerSensor));
	const orientation = useOrientation();

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

	const portraitStyle = 'max-h-[46dvh] md:max-h-[30dvh] lg:max-h-[34dvh]';
	// const portraitStyle = 'max-h-[46dvh] md:max-h-[30dvh] lg:max-h-[27.5dvh]';
	const landscapeStyle = 'max-h-[45dvw] md:max-h-[36.5dvw] lg:max-h-[40dvh] xl:max-h-[20dvw] 2xl:max-h-[27dvh]';
	// const landscapeStyle = 'max-h-[45dvw] md:max-h-[36.5dvw] lg:max-h-[40dvh] xl:max-h-[20dvw] 2xl:max-h-[29.5dvh]';

	return (
		<DndContext
			collisionDetection={closestCenter}
			modifiers={[restrictToParentElement]}
			sensors={sensors}
			onDragEnd={handleDragEnd}
		>
			<SortableContext items={store.notes.map((n) => n.id)} strategy={verticalListSortingStrategy}>
				<div
					className={cn(
						'hide-scrollbar flex flex-1 flex-col gap-2 overflow-y-auto',
						orientation === 'portrait' ? portraitStyle : landscapeStyle
					)}
				>
					{visibleNotes.map((note, idx) => children(note, idx))}
				</div>
			</SortableContext>
		</DndContext>
	);
});
