import { useRef, useState } from 'react';
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
	useSensor,
	useSensors,
} from '@dnd-kit/core';
import { snapCenterToCursor } from '@dnd-kit/modifiers';
import { observer } from 'mobx-react-lite';

import { useStore } from '@/app/providers';
import { TODO_LIMITS, type TodoCanvas, type TodoList } from '@/entities/todo';
import { cn } from '@/shared/lib/utils';

import { BoardSlot } from './BoardSlot';
import { ListCard } from './ListCard';

type TodoDrag = { kind: 'list'; id: string } | { kind: 'item'; id: string; listId: string };
type DraftItems = Record<string, string[]>;
type ItemDrop = { listId: string; position: number };

const orderedItems = (list: TodoList) => [...list.items].sort((a, b) => a.position - b.position);

interface BoardProps {
	canvas: TodoCanvas;
	onEdit: (list: TodoList) => void;
	onDelete: (list: TodoList) => void;
}

export const Board = observer(({ canvas, onEdit, onDelete }: BoardProps) => {
	const sensors = useSensors(
		useSensor(MouseSensor, { activationConstraint: { distance: 6 } }),
		useSensor(TouchSensor, { activationConstraint: { delay: 300, tolerance: 8 } }),
		useSensor(KeyboardSensor)
	);

	const { todoStore } = useStore();

	const [drag, setDrag] = useState<TodoDrag | null>(null);
	const [draftItems, setDraftItems] = useState<DraftItems | null>(null);

	const boardRef = useRef<HTMLDivElement>(null);
	const draftRef = useRef<DraftItems | null>(null);

	const getInitialItems = (): DraftItems =>
		Object.fromEntries(canvas.lists.map((list) => [list.id, orderedItems(list).map((item) => item.id)]));

	const collisionDetection: CollisionDetection = (args) => {
		const active = args.active.data.current;

		if (active?.kind === 'list') {
			const containers = args.droppableContainers.filter(({ data }) => data.current?.kind === 'slot');

			return (args.pointerCoordinates ? pointerWithin : rectIntersection)({
				...args,
				droppableContainers: containers,
			});
		}

		if (active?.kind !== 'item') return [];

		const draft = draftRef.current;
		const containers = args.droppableContainers.filter(({ data }) => {
			if (data.current?.kind !== 'items') return false;

			const list = canvas.lists.find(({ id }) => id === data.current?.listId);
			if (!list) return false;

			const count = draft?.[list.id]?.length ?? list.items.length;
			const containsActive = draft?.[list.id]?.includes(active.id) ?? list.id === active.listId;

			return containsActive || count < TODO_LIMITS.ITEMS;
		});

		return (args.pointerCoordinates ? pointerWithin : rectIntersection)({
			...args,
			droppableContainers: containers,
		});
	};

	const getDrop = (event: DragMoveEvent): ItemDrop | null => {
		const active = event.active.data.current;
		const over = event.over;
		if (active?.kind !== 'item' || !over) return null;

		const targetListId = over.data.current?.listId;
		const target = canvas.lists.find(({ id }) => id === targetListId);
		if (!target) return null;

		const draft = draftRef.current;
		const ids = (draft?.[target.id] ?? orderedItems(target).map((item) => item.id)).filter(
			(id) => id !== active.id
		);

		if (ids.length >= TODO_LIMITS.ITEMS) return null;

		const rect = event.active.rect.current.translated;
		if (!rect) return null;

		const pointerY = rect.top + rect.height / 2;
		if (pointerY === undefined) return null;

		const rows = Array.from(boardRef.current?.querySelectorAll<HTMLElement>('[data-todo-item]') ?? [])
			.filter((element) => element.dataset.todoList === target.id && element.dataset.todoItem !== active.id)
			.map((element) => ({ id: element.dataset.todoItem!, rect: element.getBoundingClientRect() }));

		let position = ids.length;

		for (let idx = 0; idx < ids.length; idx++) {
			const row = rows.find(({ id }) => id === ids[idx]);
			if (!row) continue;

			if (pointerY < row.rect.top + row.rect.height / 2) {
				position = idx;
				break;
			}
		}

		return { listId: target.id, position };
	};

	const updateDraft = (event: DragMoveEvent) => {
		const active = event.active.data.current;
		if (active?.kind !== 'item') return;

		const target = getDrop(event);
		if (!target) return;

		const current = draftRef.current;
		if (!current) return;

		const sourceListId = Object.keys(current).find((id) => current[id].includes(active.id));
		if (!sourceListId) return;

		const sourceIds = current[sourceListId];
		const currentIndex = sourceIds.indexOf(active.id);
		if (sourceListId === target.listId && currentIndex === target.position) return;

		const next: DraftItems = Object.fromEntries(Object.entries(current).map(([id, ids]) => [id, [...ids]]));
		next[sourceListId] = next[sourceListId].filter((id) => id !== active.id);
		next[target.listId].splice(target.position, 0, active.id);

		draftRef.current = next;
		setDraftItems(next);
	};

	const reset = () => {
		setDrag(null);
		setDraftItems(null);
		draftRef.current = null;
	};

	const end = (event: DragEndEvent) => {
		const active = event.active.data.current;
		const over = event.over?.data.current;
		const finalDraft = draftRef.current;

		reset();

		if (todoStore.isLoading || !event.over) return;

		if (active?.kind === 'list') {
			const list = canvas.lists.find(({ id }) => id === active.id);
			const slot = over?.slot;

			if (list && typeof slot === 'number' && slot !== list.slot) void todoStore.moveList(list.id, slot);

			return;
		}

		if (active?.kind !== 'item' || !finalDraft) return;

		const source = canvas.lists.find(({ id }) => id === active.listId);
		if (!source) return;

		const targetListId = Object.keys(finalDraft).find((id) => finalDraft[id].includes(active.id));
		if (!targetListId) return;

		const targetList = canvas.lists.find(({ id }) => id === targetListId);
		if (!targetList) return;

		const targetIds = finalDraft[targetListId];
		const position = targetIds.indexOf(active.id);

		if (position < 0) return;

		if (targetListId !== source.id) {
			void (async () => {
				const success = await todoStore.moveItem(
					active.id,
					targetListId,
					targetList.is_collapsed ? targetList.items.length : position
				);

				if (!success) return;

				if (targetList.is_collapsed) await todoStore.setListCollapsed(targetListId, false);
			})();

			return;
		}

		const originalIds = orderedItems(source).map((item) => item.id);
		if (targetIds.some((id, idx) => id !== originalIds[idx])) void todoStore.reorderItems(source.id, targetIds);
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
			onDragMove={updateDraft}
			onDragOver={updateDraft}
			onDragStart={({ active }) => {
				const data = active.data.current as TodoDrag;
				setDrag(data);

				if (data.kind === 'item') {
					const initial = getInitialItems();
					draftRef.current = initial;
					setDraftItems(initial);
				}
			}}
		>
			<div className="overflow-x-auto not-xl:snap-x not-xl:snap-proximity">
				<div
					ref={boardRef}
					className="core-gap grid w-max auto-rows-100 grid-cols-[repeat(4,calc(100vw-1.5rem))] md:grid-cols-[repeat(4,calc(50vw-1.1rem))] lg:grid-cols-[repeat(4,calc(50vw-1.4rem))] xl:w-full xl:auto-rows-[clamp(280px,calc((100dvh-220px)/2),430px)] xl:grid-cols-4 not-lg:landscape:grid-cols-[repeat(4,calc(50vw-1.2rem))] not-xl:landscape:grid-cols-[repeat(4,calc(50vw-1.4rem))]"
				>
					{Array.from({ length: TODO_LIMITS.LISTS }, (_, slot) => {
						const list = canvas.lists.find((entry) => entry.slot === slot);

						return (
							<BoardSlot
								key={slot}
								disabled={todoStore.isLoading || drag?.kind !== 'list'}
								dragging={drag?.kind === 'list'}
								slot={slot}
							>
								{list && (
									<ListCard
										key={list.id}
										activeItemId={drag?.kind === 'item' ? drag.id : null}
										draftIds={draftItems?.[list.id] ?? null}
										list={list}
										sourceListId={drag?.kind === 'item' ? drag.listId : null}
										onDelete={() => onDelete(list)}
										onEdit={() => onEdit(list)}
									/>
								)}
							</BoardSlot>
						);
					})}
				</div>
			</div>
			{createPortal(
				<DragOverlay dropAnimation={null} modifiers={drag?.kind === 'item' ? [snapCenterToCursor] : undefined}>
					{(draggedList || draggedItem) && (
						<div
							className={cn(
								'pointer-events-none rounded-md border border-(--accent-primary) bg-(--bg-secondary) shadow-(--shadow-contrast)',
								draggedItem ? 'max-w-48 truncate px-2 py-1 text-xs opacity-85' : 'p-3 text-sm'
							)}
						>
							{draggedList?.title ?? draggedItem?.text}
						</div>
					)}
				</DragOverlay>,
				document.body
			)}
		</DndContext>
	);
});
