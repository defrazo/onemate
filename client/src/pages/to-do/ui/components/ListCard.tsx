import { useEffect, useRef, useState } from 'react';
import { useDndContext, useDraggable, useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useCombinedRefs } from '@dnd-kit/utilities';
import { IconListSearch } from '@tabler/icons-react';
import { observer } from 'mobx-react-lite';

import { useStore } from '@/app/providers';
import { LIST_COLORS, TODO_LIMITS, type TodoItem, type TodoList } from '@/entities/todo';
import { cn } from '@/shared/lib/utils';
import { Button, NoContent } from '@/shared/ui';

import { AddItem, ItemRow, ListActions, ListHidden } from '.';

interface ListCardProps {
	list: TodoList;
	activeItemId: string | null;
	sourceListId: string | null;
	draftIds: string[] | null;
	onEdit: () => void;
	onDelete: () => void;
}

export const ListCard = observer(({ list, activeItemId, sourceListId, draftIds, onEdit, onDelete }: ListCardProps) => {
	const { active, over } = useDndContext();

	const { todoStore } = useStore();

	const [isAdding, setIsAdding] = useState(false);
	const [activeActionsId, setActiveActionsId] = useState<string | null>(null);

	const cardRef = useRef<HTMLElement>(null);
	const scrollRef = useRef<HTMLDivElement>(null);

	const { setNodeRef, setActivatorNodeRef, attributes, listeners, isDragging } = useDraggable({
		id: `list:${list.id}`,
		data: { kind: 'list', id: list.id },
		disabled: todoStore.isLoading,
	});

	const { setNodeRef: setDropRef } = useDroppable({
		id: `items:${list.id}`,
		data: { kind: 'items', listId: list.id },
		disabled: todoStore.isLoading,
	});

	const setCardRef = useCombinedRefs(setNodeRef, setDropRef, (node: HTMLElement | null) => (cardRef.current = node));

	const scrollToBottom = () => {
		requestAnimationFrame(() => {
			scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
		});
	};

	const color = Object.hasOwn(LIST_COLORS, list.color) ? list.color : 'slate';

	const itemsById = new Map<string, TodoItem>(list.items.map((item) => [item.id, item]));
	const originalIds = [...list.items].sort((a, b) => a.position - b.position).map((item) => item.id);
	const ids = draftIds ?? originalIds;

	const completed = list.items.filter((item) => item.is_completed).length;
	const isCompleted = list.items.length > 0 && completed === list.items.length;
	const isEmpty = list.items.length === 0 && ids.length === 0;

	const isSource = sourceListId === list.id;
	const hasActiveItem = activeItemId !== null && ids.includes(activeItemId);
	const hiddenItem = isSource && activeItemId && !hasActiveItem ? itemsById.get(activeItemId) : undefined;

	const isDropTarget =
		list.is_collapsed &&
		active?.data.current?.kind === 'item' &&
		active.data.current.listId !== list.id &&
		over?.data.current?.listId === list.id;

	const handleAddItem = (text: string): Promise<boolean> => {
		if (todoStore.isLoading || list.items.length >= TODO_LIMITS.ITEMS) return Promise.resolve(false);
		return todoStore.createItem(list.id, text);
	};

	const handleToggleCollapse = () => {
		setIsAdding(false);
		void todoStore.setListCollapsed(list.id, !list.is_collapsed);
	};

	const handleShow = () => {
		void todoStore.setListCollapsed(list.id, false);
	};

	const handleActionsToggle = (id: string) => {
		setActiveActionsId((current) => (current === id ? null : id));
	};

	useEffect(() => {
		if (activeItemId) setActiveActionsId(null);
	}, [activeItemId]);

	useEffect(() => {
		if (!activeActionsId) return;

		const handlePointerDown = (event: PointerEvent) => {
			const target = event.target;
			if (!(target instanceof Node)) return;

			const activeRow = Array.from(cardRef.current?.querySelectorAll('[data-todo-item]') ?? []).find(
				(element) => element.getAttribute('data-todo-item') === activeActionsId
			);
			if (!activeRow?.contains(target)) setActiveActionsId(null);
		};

		document.addEventListener('pointerdown', handlePointerDown);

		return () => document.removeEventListener('pointerdown', handlePointerDown);
	}, [activeActionsId]);

	useEffect(() => {
		if (!isAdding) return;

		const handlePointerDown = (event: PointerEvent) => {
			const target = event.target;
			if (target instanceof Node && !cardRef.current?.contains(target)) setIsAdding(false);
		};

		document.addEventListener('pointerdown', handlePointerDown);

		return () => document.removeEventListener('pointerdown', handlePointerDown);
	}, [isAdding]);

	return (
		<article
			ref={setCardRef}
			aria-label={list.title}
			className={cn(
				'relative flex h-full min-w-0 flex-col self-start rounded-lg border border-transparent bg-(--bg-secondary) shadow-(--shadow-contrast) transition-colors not-xl:snap-start focus-within:z-10 hover:border-(--border-primary)',
				isCompleted && 'bg-(--tone)',
				isDragging ? 'opacity-30' : isCompleted && 'opacity-60'
			)}
		>
			<header className="flex min-w-0 items-center gap-2 px-3 py-2">
				<div
					ref={setActivatorNodeRef}
					className="flex min-w-0 flex-1 cursor-grab touch-none items-center gap-2 active:cursor-grabbing"
					{...attributes}
					{...listeners}
					aria-label={`Переместить список «${list.title}»`}
				>
					<span
						className={cn('ml-0.5 h-1 w-4 shrink-0 rounded-full', isCompleted && 'opacity-40')}
						style={{ backgroundColor: `var(--palette-${color})` }}
					/>
					<h2
						className={cn(
							'min-w-0 truncate pt-px font-bold select-none',
							isCompleted && 'text-(--text-disabled) line-through'
						)}
						title={list.title}
					>
						{list.title}
					</h2>
				</div>
				<ListActions
					disabled={todoStore.isLoading}
					hide={list.is_collapsed}
					title={list.title}
					onDelete={onDelete}
					onEdit={onEdit}
					onToggleHide={handleToggleCollapse}
				/>
			</header>
			{list.is_collapsed && <ListHidden isDropTarget={isDropTarget} onShow={handleShow} />}
			{!list.is_collapsed && (
				<>
					<div
						ref={scrollRef}
						className={cn(
							'core-scrollbar mx-3 flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto rounded-md pr-0.5 not-xl:scrollbar-none xl:overscroll-contain',
							isEmpty && 'justify-center'
						)}
					>
						<SortableContext items={ids.map((id) => `item:${id}`)} strategy={verticalListSortingStrategy}>
							{isEmpty && (
								<NoContent icon={IconListSearch} title="Список пуст">
									{!isAdding && (
										<Button
											className="-mt-0.75 h-6 rounded-md text-xs"
											disabled={todoStore.isLoading}
											onClick={() => setIsAdding(true)}
										>
											Добавить пункт
										</Button>
									)}
								</NoContent>
							)}
							<ul className="flex shrink-0 flex-col gap-2">
								{ids.map((id) => {
									const item = itemsById.get(id);

									if (id === activeItemId) {
										if (isSource && item)
											return <ItemRow key={id} placeholder item={item} listId={list.id} />;

										return (
											<li
												key={id}
												aria-hidden="true"
												className="h-7 shrink-0 rounded-md border border-dashed border-(--accent-primary) bg-(--accent-primary-muted)"
											/>
										);
									}

									if (!item) return null;

									return (
										<ItemRow
											key={id}
											actionsOpen={activeActionsId === id}
											item={item}
											listId={list.id}
											onActionsClose={() => setActiveActionsId(null)}
											onActionsToggle={() => handleActionsToggle(id)}
										/>
									);
								})}
								{hiddenItem && (
									<ItemRow key={hiddenItem.id} hidden item={hiddenItem} listId={list.id} />
								)}
							</ul>
						</SortableContext>
					</div>
					<div className={cn('mx-3 mt-2 shrink-0', isEmpty && isAdding && 'mt-0.5 mb-3')}>
						<AddItem
							active={isAdding}
							disabled={todoStore.isLoading}
							limit={TODO_LIMITS.ITEMS}
							limitReached={list.items.length >= TODO_LIMITS.ITEMS}
							maxLength={TODO_LIMITS.ITEM_TEXT}
							showTrigger={!isEmpty}
							onActivate={() => setIsAdding(true)}
							onAdd={handleAddItem}
							onAdded={scrollToBottom}
							onDeactivate={() => setIsAdding(false)}
						/>
					</div>
				</>
			)}
			{!list.is_collapsed && !isEmpty && (
				<footer className={cn('flex flex-col gap-2 px-3 pt-2 pb-3 select-none', isCompleted && 'opacity-40')}>
					<div className="flex items-center justify-between gap-2 text-xs text-(--text-secondary)">
						<span>Выполнено</span>
						<span>
							{completed} из {list.items.length}
						</span>
					</div>
					<div
						aria-label="Выполнено пунктов"
						aria-valuemax={list.items.length || 1}
						aria-valuemin={0}
						aria-valuenow={completed}
						className="h-1 min-w-0 overflow-hidden rounded-full bg-(--tone-strong)"
						role="progressbar"
					>
						<div
							className="h-full rounded-full bg-(--accent-primary) transition-[width]"
							style={{ width: `${list.items.length ? (completed / list.items.length) * 100 : 0}%` }}
						/>
					</div>
				</footer>
			)}
		</article>
	);
});
