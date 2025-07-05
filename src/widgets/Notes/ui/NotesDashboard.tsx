import { ReactElement } from 'react';
import { closestCenter, DndContext, DragEndEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { restrictToParentElement } from '@dnd-kit/modifiers';
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';

import type { Note } from '../model';

interface NotesDashboardProps {
	notes: Note[];
	focusedId: string | null;
	onOrderChange: (newNotes: Note[]) => void;
	children: (note: Note, index: number) => ReactElement;
}

export const NotesDashboard = ({ notes, focusedId, onOrderChange, children }: NotesDashboardProps) => {
	const sensors = useSensors(useSensor(PointerSensor));
	const visibleNotes = focusedId ? notes.filter((note) => note.id === focusedId) : notes;

	const handleDragEnd = (event: DragEndEvent) => {
		const { active, over } = event;

		if (active.id !== over?.id) {
			const oldIndex = notes.findIndex((n) => n.id === active.id);
			const newIndex = notes.findIndex((n) => n.id === over?.id);

			const newNotes = arrayMove(notes, oldIndex, newIndex);
			onOrderChange(newNotes);
		}
	};

	return (
		<DndContext
			collisionDetection={closestCenter}
			modifiers={[restrictToParentElement]}
			sensors={sensors}
			onDragEnd={handleDragEnd}
		>
			<SortableContext items={notes.map((n) => n.id)} strategy={verticalListSortingStrategy}>
				<div className="hide-scrollbar flex flex-1 flex-col gap-2 overflow-y-auto">
					{visibleNotes.map((note, idx) => children(note, idx))}
				</div>
			</SortableContext>
		</DndContext>
	);
};
