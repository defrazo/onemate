import { useState } from 'react';
import { IconEdit, IconTrash } from '@tabler/icons-react';
import { observer } from 'mobx-react-lite';

import { cn } from '@/shared/lib/utils';
import { Button, Checkbox, InlineEdit } from '@/shared/ui';

import { TODO_LIMITS, type TodoItem, type TodoStore } from '../model';

export const ItemRow = observer(({ item, store }: { item: TodoItem; store: TodoStore }) => {
	const [editing, setEditing] = useState(false);
	const [draft, setDraft] = useState(item.text);
	const [error, setError] = useState<string | null>(null);

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
		<li className="group/item flex flex-col gap-1">
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
});
