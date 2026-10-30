import { useState } from 'react';
import { useDraggable, useDroppable } from '@dnd-kit/core';
import { useCombinedRefs } from '@dnd-kit/utilities';
import { IconEdit, IconGripVertical, IconTrash } from '@tabler/icons-react';
import { observer } from 'mobx-react-lite';

import { cn } from '@/shared/lib/utils';
import { Button, Checkbox, InlineEdit } from '@/shared/ui';

import { TODO_LIMITS, type TodoItem, type TodoStore } from '../model';

export const ItemRow = observer(
	({ item, store, dropBefore }: { item: TodoItem; store: TodoStore; dropBefore: boolean }) => {
		const [editing, setEditing] = useState(false);
		const [draft, setDraft] = useState(item.text);
		const [error, setError] = useState<string | null>(null);
		const { setNodeRef, setActivatorNodeRef, attributes, listeners, isDragging } = useDraggable({
			id: `item:${item.id}`,
			data: { kind: 'item', id: item.id, listId: item.list_id },
			disabled: editing || store.isLoading,
		});
		const { setNodeRef: setDropRef } = useDroppable({
			id: `item:${item.id}`,
			data: { kind: 'item', id: item.id, listId: item.list_id },
			disabled: store.isLoading,
		});
		const setItemRef = useCombinedRefs(setNodeRef, setDropRef);

		const save = async () => {
			if (store.isLoading) return;

			if (!draft.trim()) {
				setError('Введите текст пункта');
				return;
			}

			await store.updateItem(item.id, { text: draft.trim() });

			if (!store.error) {
				setEditing(false);
				setError(null);
			}
		};

		return (
			<li ref={setItemRef} className={cn('group/item relative flex flex-col gap-1', isDragging && 'opacity-30')}>
				{dropBefore && (
					<span
						aria-hidden="true"
						className="absolute inset-x-0 -top-1 border-t-2 border-(--accent-primary)"
					/>
				)}
				<div className="flex min-w-0 items-start gap-2">
					{editing ? (
						<InlineEdit
							label="Текст пункта"
							maxLength={TODO_LIMITS.ITEM_TEXT}
							saving={store.isLoading}
							value={draft}
							onCancel={() => {
								setEditing(false);
								setError(null);
							}}
							onChange={setDraft}
							onConfirm={() => void save()}
						/>
					) : (
						<>
							<Button
								ref={setActivatorNodeRef}
								centerIcon={<IconGripVertical className="size-4" />}
								className="mt-0.5 shrink-0 cursor-grab touch-none active:cursor-grabbing"
								disabled={store.isLoading}
								padding="none"
								title="Переместить пункт"
								variant="icon"
								{...attributes}
								{...listeners}
								aria-label={`Переместить пункт «${item.text}»`}
							/>
							<Checkbox
								aria-label={`Выполнено: ${item.text}`}
								checked={item.is_completed}
								className="mt-0.5 shrink-0"
								disabled={store.isLoading}
								onChange={(checked) => void store.setItemCompleted(item.id, checked)}
							/>
							<span
								className={cn(
									'min-w-0 flex-1 text-sm wrap-break-word',
									item.is_completed && 'text-(--text-disabled) line-through'
								)}
							>
								{item.text}
							</span>
							<div className="flex shrink-0 items-center gap-1 opacity-100 group-focus-within/item:opacity-100 group-hover/item:opacity-100 [@media(hover:hover)]:opacity-0">
								<Button
									aria-label={`Редактировать «${item.text}»`}
									centerIcon={<IconEdit className="size-4" />}
									disabled={store.isLoading}
									padding="none"
									title="Редактировать"
									variant="icon"
									onClick={() => {
										setDraft(item.text);
										setEditing(true);
									}}
								/>
								<Button
									aria-label={`Удалить «${item.text}»`}
									centerIcon={<IconTrash className="size-4" />}
									disabled={store.isLoading}
									padding="none"
									title="Удалить"
									variant="icon"
									onClick={() => void store.deleteItem(item.id)}
								/>
							</div>
						</>
					)}
				</div>
				{error && (
					<p className="text-xs text-(--status-error)" role="alert">
						{error}
					</p>
				)}
			</li>
		);
	}
);
