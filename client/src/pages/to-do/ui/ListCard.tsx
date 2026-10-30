import { useEffect, useRef, useState } from 'react';
import { useDndContext, useDraggable, useDroppable } from '@dnd-kit/core';
import { useCombinedRefs } from '@dnd-kit/utilities';
import { IconChevronDown, IconChevronUp, IconDots, IconEdit, IconPlus, IconTrash } from '@tabler/icons-react';
import { observer } from 'mobx-react-lite';

import { cn } from '@/shared/lib/utils';
import { Button, Input } from '@/shared/ui';

import { TODO_LIMITS, type TodoList, type TodoStore } from '../model';
import { ItemRow, LIST_COLORS } from '.';
import type { ItemDrop } from './TodoBoard';

interface ListCardProps {
	list: TodoList;
	store: TodoStore;
	itemDrop: ItemDrop | null;
	onEdit: () => void;
	onDelete: () => void;
}

export const ListCard = observer(({ list, store, itemDrop, onEdit, onDelete }: ListCardProps) => {
	const [text, setText] = useState('');
	const [menu, setMenu] = useState(false);

	const inputRef = useRef<HTMLInputElement>(null);
	const menuRef = useRef<HTMLDivElement>(null);
	const menuTriggerRef = useRef<HTMLButtonElement>(null);

	const completed = list.items.filter((item) => item.is_completed).length;
	const done = list.items.length > 0 && completed === list.items.length;
	const color = Object.hasOwn(LIST_COLORS, list.color) ? list.color : 'slate';
	const { active } = useDndContext();
	const { setNodeRef, setActivatorNodeRef, attributes, listeners, isDragging } = useDraggable({
		id: `list:${list.id}`,
		data: { kind: 'list', id: list.id },
		disabled: store.isLoading,
	});
	const { setNodeRef: setDropRef, isOver } = useDroppable({
		id: `items:${list.id}`,
		data: { kind: 'items', listId: list.id },
		disabled: store.isLoading,
	});
	const setCardRef = useCombinedRefs(setNodeRef, setDropRef);
	const targetItems = [...list.items]
		.filter(({ id }) => id !== active?.data.current?.id)
		.sort((a, b) => a.position - b.position);

	useEffect(() => {
		if (!menu) return;

		const close = (event: PointerEvent) => {
			if (!menuRef.current?.contains(event.target as Node)) setMenu(false);
		};

		const escape = (event: KeyboardEvent) => {
			if (event.key === 'Escape') {
				setMenu(false);
				menuTriggerRef.current?.focus();
			}
		};

		document.addEventListener('pointerdown', close);
		document.addEventListener('keydown', escape);

		return () => {
			document.removeEventListener('pointerdown', close);
			document.removeEventListener('keydown', escape);
		};
	}, [menu]);

	const add = async () => {
		if (!text.trim() || store.isLoading || list.items.length >= TODO_LIMITS.ITEMS) return;

		await store.createItem(list.id, text.trim());

		if (!store.error) setText('');

		inputRef.current?.focus();
	};

	return (
		<article
			ref={setCardRef}
			aria-label={list.title}
			className={cn(
				'relative min-w-0 self-start rounded-lg border border-transparent bg-(--bg-secondary) shadow-(--shadow-contrast) transition-colors focus-within:z-10 hover:border-(--border-primary)',
				done && 'bg-(--tone) opacity-60',
				isDragging && 'opacity-30',
				active?.data.current?.kind === 'item' && isOver && 'outline-2 outline-(--accent-primary)'
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
						className={cn('h-1 w-3 shrink-0 rounded-full', done && 'opacity-40')}
						style={{ backgroundColor: `var(--palette-${color})` }}
					/>
					<h2
						className={cn(
							'min-w-0 truncate pt-px font-bold',
							done && 'text-(--text-disabled) line-through'
						)}
						title={list.title}
					>
						{list.title}
					</h2>
				</div>
				<div ref={menuRef} className="relative shrink-0">
					<Button
						ref={menuTriggerRef}
						aria-expanded={menu}
						aria-label={`Действия со списком «${list.title}»`}
						centerIcon={<IconDots className="size-4" />}
						disabled={store.isLoading}
						padding="none"
						title="Действия со списком"
						variant="icon"
						onClick={() => setMenu(!menu)}
					/>
					{menu && (
						<div className="absolute top-full right-0 z-20 mt-1 flex w-44 flex-col rounded-xl border border-(--border-primary) bg-(--bg-secondary) p-1.5 shadow-xl">
							<Button
								className="justify-start text-sm hover:bg-(--tone-hover)"
								disabled={store.isLoading}
								leftIcon={<IconEdit className="size-4" />}
								variant="custom"
								onClick={() => {
									setMenu(false);
									onEdit();
								}}
							>
								Редактировать
							</Button>
							<Button
								className="justify-start text-sm hover:bg-(--tone-hover)"
								disabled={store.isLoading}
								leftIcon={
									list.is_collapsed ? (
										<IconChevronDown className="size-4" />
									) : (
										<IconChevronUp className="size-4" />
									)
								}
								variant="custom"
								onClick={() => {
									setMenu(false);
									void store.setListCollapsed(list.id, !list.is_collapsed);
								}}
							>
								{list.is_collapsed ? 'Развернуть' : 'Свернуть'}
							</Button>
							<Button
								className="justify-start text-sm text-(--status-error) hover:bg-(--tone-hover)"
								disabled={store.isLoading}
								leftIcon={<IconTrash className="size-4" />}
								variant="custom"
								onClick={() => {
									setMenu(false);
									onDelete();
								}}
							>
								Удалить
							</Button>
						</div>
					)}
				</div>
			</header>
			{!list.is_collapsed && (
				<div className="flex flex-col gap-3 px-3 pb-3">
					{list.items.length > 0 ? (
						<ul className="flex flex-col gap-2">
							{[...list.items]
								.sort((a, b) => a.position - b.position)
								.map((item) => (
									<ItemRow
										key={item.id}
										dropBefore={!!itemDrop && targetItems[itemDrop.position]?.id === item.id}
										item={item}
										store={store}
									/>
								))}
							{itemDrop?.position === targetItems.length && (
								<li aria-hidden="true" className="relative h-0">
									<span className="absolute inset-x-0 -top-1 border-t-2 border-(--accent-primary)" />
								</li>
							)}
						</ul>
					) : (
						<p
							className={cn(
								'py-2 text-sm text-(--text-disabled)',
								itemDrop && 'border-t-2 border-(--accent-primary)'
							)}
						>
							Пока нет пунктов
						</p>
					)}
					{list.items.length < TODO_LIMITS.ITEMS ? (
						<form
							className="flex items-center gap-1"
							onSubmit={(event) => {
								event.preventDefault();
								void add();
							}}
						>
							<Input
								ref={inputRef}
								aria-label="Новый пункт"
								className="text-sm"
								maxLength={TODO_LIMITS.ITEM_TEXT}
								placeholder="Добавить пункт…"
								readOnly={store.isLoading}
								value={text}
								onChange={(event) => setText(event.target.value)}
								onKeyDown={(event) => {
									if (event.key === 'Enter' && event.nativeEvent.isComposing) event.preventDefault();
								}}
							/>
							<Button
								aria-label="Добавить пункт"
								centerIcon={<IconPlus className="size-4" />}
								disabled={store.isLoading || !text.trim()}
								padding="none"
								title="Добавить пункт"
								type="submit"
								variant="icon"
							/>
						</form>
					) : (
						<p className="text-xs text-(--text-disabled)">Максимум {TODO_LIMITS.ITEMS} пунктов</p>
					)}
				</div>
			)}
			<footer className={cn('flex items-center gap-2 px-3 pb-3', done && 'opacity-40')}>
				<div
					aria-label="Выполнено пунктов"
					aria-valuemax={list.items.length || 1}
					aria-valuemin={0}
					aria-valuenow={completed}
					className="h-1 min-w-0 flex-1 overflow-hidden rounded-full bg-(--tone-strong)"
					role="progressbar"
				>
					<div
						className="h-full rounded-full bg-(--accent-primary) transition-[width]"
						style={{ width: `${list.items.length ? (completed / list.items.length) * 100 : 0}%` }}
					/>
				</div>
				<span className="text-xs text-(--text-secondary)">
					{completed} / {list.items.length}
				</span>
			</footer>
		</article>
	);
});
