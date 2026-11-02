import { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { IconDots, IconPencil, IconTrash, IconX } from '@tabler/icons-react';
import { observer } from 'mobx-react-lite';

import { useStore } from '@/app/providers';
import { TODO_LIMITS, type TodoItem } from '@/entities/todo';
import { useResponsive } from '@/shared/lib/hooks';
import { cn } from '@/shared/lib/utils';
import { Button, Checkbox, ConfirmActions, Input } from '@/shared/ui';

interface ItemRowProps {
	item: TodoItem;
	listId: string;
	actionsOpen?: boolean;
	hidden?: boolean;
	placeholder?: boolean;
	onActionsClose?: () => void;
	onActionsToggle?: () => void;
}

export const ItemRow = observer(
	({
		item,
		listId,
		actionsOpen = false,
		hidden = false,
		placeholder = false,
		onActionsClose,
		onActionsToggle,
	}: ItemRowProps) => {
		const { isMobile } = useResponsive();

		const { notifyStore, todoStore } = useStore();

		const [isEditing, setIsEditing] = useState(false);
		const [draftText, setDraftText] = useState(item.text);

		const { setNodeRef, setActivatorNodeRef, attributes, listeners, transform, transition, isDragging } =
			useSortable({
				id: `item:${item.id}`,
				data: { kind: 'item', id: item.id, listId },
				disabled: isEditing || todoStore.isLoading,
			});

		const handleEdit = () => {
			setDraftText(item.text);
			setIsEditing(true);
		};

		const handleCancelEdit = () => {
			if (todoStore.isLoading) return;

			setIsEditing(false);
			setDraftText(item.text);
		};

		const handleSaveEdit = async () => {
			if (todoStore.isLoading) return;

			const text = draftText.trim();

			if (!text) {
				notifyStore.setNotice('Введите текст пункта', 'info');
				return;
			}

			if (text === item.text) {
				handleCancelEdit();
				return;
			}

			try {
				await todoStore.updateItem(item.id, { text });
			} catch {
				notifyStore.setNotice('Что-то пошло не так', 'error');
				return;
			} finally {
				setIsEditing(false);
			}
		};

		return (
			<li
				ref={setNodeRef}
				className={cn(
					'group/item min-h-6.5 flex-col gap-2',
					hidden ? 'pointer-events-none absolute' : 'relative flex',
					placeholder &&
						'rounded-md border border-dashed border-(--accent-primary) bg-(--accent-primary-muted)',
					(hidden || (isDragging && !placeholder)) && 'opacity-0'
				)}
				data-todo-item={item.id}
				data-todo-list={listId}
				style={{ transform: CSS.Transform.toString(transform), transition }}
			>
				<div className={cn(placeholder && 'invisible')}>
					<div className="flex min-w-0 items-center">
						{isEditing ? (
							<div className="flex min-w-0 flex-1 items-center gap-2">
								<Input
									autoFocus
									aria-label="Текст пункта"
									className="min-w-0 flex-1 bg-transparent py-0 text-sm"
									disabled={todoStore.isLoading}
									maxLength={TODO_LIMITS.ITEM_TEXT}
									value={draftText}
									onChange={(event) => setDraftText(event.target.value)}
									onKeyDown={(event) => {
										if (event.nativeEvent.isComposing) return;

										if (event.key === 'Enter') {
											event.preventDefault();
											event.stopPropagation();
											void handleSaveEdit();
										}

										if (event.key === 'Escape') {
											event.preventDefault();
											event.stopPropagation();
											handleCancelEdit();
										}
									}}
								/>
								<ConfirmActions
									confirmDisabled={!draftText.trim()}
									confirmLabel="Сохранить"
									disabled={todoStore.isLoading}
									onCancel={handleCancelEdit}
									onConfirm={() => void handleSaveEdit()}
								/>
							</div>
						) : (
							<>
								<Checkbox
									aria-label={`Выполнено: ${item.text}`}
									checked={item.is_completed}
									className="shrink-0"
									disabled={todoStore.isLoading}
									size={isMobile ? 'lg' : 'md'}
									onChange={(checked) => void todoStore.setItemCompleted(item.id, checked)}
								/>
								<span
									ref={setActivatorNodeRef}
									className={cn(
										'trim mx-2 min-w-0 flex-1 cursor-grab touch-pan-y text-sm leading-3.5 break-all select-none active:cursor-grabbing',
										item.is_completed && 'text-(--text-disabled) line-through',
										todoStore.isLoading && 'cursor-default'
									)}
									{...attributes}
									{...listeners}
									aria-label={`Переместить пункт «${item.text}»`}
								>
									{item.text}
								</span>
								<div className="flex shrink-0 items-center gap-3 md:gap-2 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-focus-within/item:opacity-100 [@media(hover:hover)]:group-hover/item:opacity-100">
									{isMobile && !actionsOpen && (
										<Button
											aria-expanded={actionsOpen}
											aria-label={`Действия с пунктом «${item.text}»`}
											centerIcon={<IconDots className="size-5 opacity-70" />}
											disabled={todoStore.isLoading}
											padding="none"
											variant="icon"
											onClick={onActionsToggle}
										/>
									)}
									{(!isMobile || actionsOpen) && (
										<>
											<Button
												aria-label={`Редактировать «${item.text}»`}
												centerIcon={<IconPencil className="size-6 xl:size-4" />}
												disabled={todoStore.isLoading}
												padding="none"
												title="Редактировать"
												variant="icon"
												onClick={() => {
													onActionsClose?.();
													handleEdit();
												}}
											/>
											<Button
												aria-label={`Удалить «${item.text}»`}
												centerIcon={
													isMobile ? (
														<IconTrash className="size-6" />
													) : (
														<IconX className="size-4" />
													)
												}
												disabled={todoStore.isLoading}
												padding="none"
												title="Удалить"
												variant="icon"
												onClick={() => {
													onActionsClose?.();
													void todoStore.deleteItem(item.id);
												}}
											/>
										</>
									)}
								</div>
							</>
						)}
					</div>
				</div>
			</li>
		);
	}
);
