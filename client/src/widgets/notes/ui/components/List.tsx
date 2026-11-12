import { closestCenter, DndContext, type DragEndEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { restrictToParentElement } from '@dnd-kit/modifiers';
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { IconSearchOff } from '@tabler/icons-react';
import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';

import { useStore } from '@/app/providers';
import { LoadingState, NoContent } from '@/shared/ui';

import type { Note } from '../../model/types';

interface ListProps {
	notes: Note[];
	sortingDisabled: boolean;
	children: (note: Note) => ReactElement;
}

export const List = observer(({ notes, sortingDisabled, children }: ListProps) => {
	const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));

	const { notesStore } = useStore();

	const handleDragEnd = ({ active, over }: DragEndEvent) => {
		if (sortingDisabled || !over || active.id === over.id) return;

		const oldIdx = notesStore.draft.findIndex((note) => note.id === active.id);
		const newIdx = notesStore.draft.findIndex((note) => note.id === over.id);

		if (oldIdx === -1 || newIdx === -1) return;

		notesStore.updateOrder(arrayMove(notesStore.draft, oldIdx, newIdx));
	};

	return (
		<DndContext
			collisionDetection={closestCenter}
			modifiers={[restrictToParentElement]}
			sensors={sensors}
			onDragEnd={handleDragEnd}
		>
			<SortableContext items={notes.map((note) => note.id)} strategy={verticalListSortingStrategy}>
				{notesStore.isLoading && !notesStore.isReady ? (
					<LoadingState size="lg" />
				) : notes.length === 0 ? (
					<NoContent
						description="Попробуйте изменить поисковый запрос"
						icon={IconSearchOff}
						title="Ничего не найдено"
					/>
				) : (
					<div className="flex min-h-0 scrollbar-none flex-col gap-2 overflow-y-auto md:gap-3">
						{notes.map((note) => children(note))}
					</div>
				)}
			</SortableContext>
		</DndContext>
	);
});
