import { closestCenter, DndContext, type DragEndEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { restrictToParentElement } from '@dnd-kit/modifiers';
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { observer } from 'mobx-react-lite';

import { useStore } from '@/app/providers';

import type { MonitoredService } from '../../../model';
import { Card } from '.';

interface ListProps {
	services: MonitoredService[];
	onOpen: (service: MonitoredService) => void;
}

export const List = observer(({ services, onOpen }: ListProps) => {
	const { networkStore, notifyStore } = useStore();

	const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

	const handleDragEnd = ({ active, over }: DragEndEvent) => {
		if (!over || active.id === over.id || networkStore.isReordering) return;

		const oldIndex = services.findIndex((service) => service.id === active.id);
		const newIndex = services.findIndex((service) => service.id === over.id);

		if (oldIndex === -1 || newIndex === -1) return;

		void networkStore.updateOrder(arrayMove(services, oldIndex, newIndex)).catch(() => {
			notifyStore.setNotice('Что-то пошло не так', 'error');
		});
	};

	return (
		<DndContext
			collisionDetection={closestCenter}
			modifiers={[restrictToParentElement]}
			sensors={sensors}
			onDragEnd={handleDragEnd}
		>
			<SortableContext items={services.map((service) => service.id)} strategy={verticalListSortingStrategy}>
				<div className="flex min-h-0 flex-1 scrollbar-none flex-col gap-2 overflow-y-auto md:gap-3">
					{services.map((service) => (
						<Card
							key={service.id}
							disabled={networkStore.isReordering}
							service={service}
							onClick={() => onOpen(service)}
						/>
					))}
				</div>
			</SortableContext>
		</DndContext>
	);
});
