import { type ReactNode, useState } from 'react';
import { createPortal } from 'react-dom';
import {
	type CollisionDetection,
	DndContext,
	type DragEndEvent,
	type DragMoveEvent,
	DragOverlay,
	KeyboardSensor,
	MouseSensor,
	pointerWithin,
	rectIntersection,
	TouchSensor,
	useDroppable,
	useSensor,
	useSensors,
} from '@dnd-kit/core';
import { observer } from 'mobx-react-lite';

import { cn } from '@/shared/lib/utils';

import { TODO_LIMITS, type TodoCanvas, type TodoList, type TodoStore } from '../model';
import { ListCard } from './ListCard';

type TodoDrag = { kind: 'list'; id: string } | { kind: 'item'; id: string; listId: string };
export type ItemDrop = { listId: string; position: number };

const orderedItems = (list: TodoList) => [...list.items].sort((a, b) => a.position - b.position);

const Slot = ({
	slot,
	dragging,
	disabled,
	children,
}: {
	slot: number;
	dragging: boolean;
	disabled: boolean;
	children?: ReactNode;
}) => {
	const { setNodeRef, isOver } = useDroppable({ id: `slot:${slot}`, data: { kind: 'slot', slot }, disabled });
	return (
		<div
			ref={setNodeRef}
			className={cn(
				'relative min-h-12 min-w-0 self-stretch rounded-lg',
				dragging && 'bg-(--border-secondary)/10 outline outline-(--border-primary) outline-dashed',
				dragging && isOver && 'bg-(--accent-primary-muted) outline-2 outline-(--accent-primary)'
			)}
		>
			{children}
		</div>
	);
};

interface TodoBoardProps {
	canvas: TodoCanvas;
	store: TodoStore;
	onEdit: (list: TodoList) => void;
	onDelete: (list: TodoList) => void;
}

export const TodoBoard = observer(({ canvas, store, onEdit, onDelete }: TodoBoardProps) => {
	const [drag, setDrag] = useState<TodoDrag | null>(null);
	const [drop, setDrop] = useState<ItemDrop | null>(null);
	const sensors = useSensors(
		useSensor(MouseSensor, { activationConstraint: { distance: 6 } }),
		useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 8 } }),
		useSensor(KeyboardSensor)
	);

	const collisionDetection: CollisionDetection = (args) => {
		const active = args.active.data.current;
		const droppableContainers = args.droppableContainers.filter(({ data }) => {
			if (active?.kind === 'list') return data.current?.kind === 'slot';
			if (active?.kind !== 'item' || !['item', 'items'].includes(data.current?.kind)) return false;
			const list = canvas.lists.find(({ id }) => id === data.current?.listId);
			return !!list && (list.id === active.listId || list.items.length < TODO_LIMITS.ITEMS);
		});
		const collisions = (args.pointerCoordinates ? pointerWithin : rectIntersection)({
			...args,
			droppableContainers,
		});
		// Item rows take precedence over their containing card.
		const items = collisions.filter(
			({ id }) => droppableContainers.find((container) => container.id === id)?.data.current?.kind === 'item'
		);
		return items.length ? items : collisions;
	};

	const itemDrop = (event: DragMoveEvent): ItemDrop | null => {
		const active = event.active.data.current;
		const over = event.over;
		if (active?.kind !== 'item' || !over || over.id === event.active.id) return null;
		const target = canvas.lists.find(({ id }) => id === over.data.current?.listId);
		if (!target || (target.id !== active.listId && target.items.length >= TODO_LIMITS.ITEMS)) return null;
		const items = orderedItems(target).filter(({ id }) => id !== active.id);
		let position = items.length;
		if (over.data.current?.kind === 'item') {
			position = items.findIndex(({ id }) => id === over.data.current?.id);
			if (position < 0) return null;
			const rect = event.active.rect.current.translated;
			if (rect && rect.top + rect.height / 2 > over.rect.top + over.rect.height / 2) position++;
		}
		return { listId: target.id, position };
	};
	const updateDrop = (event: DragMoveEvent) => {
		const next = itemDrop(event);
		setDrop((previous) =>
			previous?.listId === next?.listId && previous?.position === next?.position ? previous : next
		);
	};
	const reset = () => {
		setDrag(null);
		setDrop(null);
	};
	const end = (event: DragEndEvent) => {
		reset();
		if (store.isLoading || !event.over) return;
		const active = event.active.data.current;
		if (active?.kind === 'list') {
			const list = canvas.lists.find(({ id }) => id === active.id);
			const slot = event.over.data.current?.slot;
			if (list && typeof slot === 'number' && slot !== list.slot) void store.moveList(list.id, slot);
			return;
		}
		const target = itemDrop(event);
		const source = canvas.lists.find(({ id }) => id === active?.listId);
		if (!target || !source) return;
		const items = orderedItems(source);
		const index = items.findIndex(({ id }) => id === active?.id);
		if (index < 0) return;
		if (target.listId === source.id) {
			if (target.position === index) return;
			const ids = items.filter(({ id }) => id !== active?.id).map(({ id }) => id);
			ids.splice(target.position, 0, items[index].id);
			void store.reorderItems(source.id, ids);
		} else {
			void store.moveItem(items[index].id, target.listId, target.position);
		}
	};
	const draggedList = drag?.kind === 'list' ? canvas.lists.find(({ id }) => id === drag.id) : undefined;
	const draggedItem =
		drag?.kind === 'item'
			? canvas.lists.find(({ id }) => id === drag.listId)?.items.find(({ id }) => id === drag.id)
			: undefined;

	return (
		<DndContext
			collisionDetection={collisionDetection}
			sensors={sensors}
			onDragCancel={reset}
			onDragEnd={end}
			onDragMove={updateDrop}
			onDragOver={updateDrop}
			onDragStart={({ active }) => {
				setDrag(active.data.current as TodoDrag);
			}}
		>
			<div className="core-gap grid min-w-140 grid-cols-2 items-start xl:grid-cols-4 @min-[35rem]:min-w-0 max-xl:@min-[52rem]:grid-cols-3">
				{Array.from({ length: TODO_LIMITS.LISTS }, (_, slot) => {
					const list = canvas.lists.find((entry) => entry.slot === slot);
					return (
						<Slot
							key={slot}
							disabled={store.isLoading || drag?.kind !== 'list'}
							dragging={drag?.kind === 'list'}
							slot={slot}
						>
							{list && (
								<ListCard
									key={list.id}
									itemDrop={drop?.listId === list.id ? drop : null}
									list={list}
									store={store}
									onDelete={() => onDelete(list)}
									onEdit={() => onEdit(list)}
								/>
							)}
						</Slot>
					);
				})}
			</div>
			{createPortal(
				<DragOverlay dropAnimation={null}>
					{(draggedList || draggedItem) && (
						<div className="rounded-lg border border-(--accent-primary) bg-(--bg-secondary) p-3 text-sm shadow-(--shadow-contrast)">
							{draggedList?.title ?? draggedItem?.text}
						</div>
					)}
				</DragOverlay>,
				document.body
			)}
		</DndContext>
	);
});
