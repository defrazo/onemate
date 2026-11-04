import { useState } from 'react';
import { IconDots, IconPencil, IconTrash, IconX } from '@tabler/icons-react';
import { observer } from 'mobx-react-lite';

import { useStore } from '@/app/providers';
import { TODO_LIMITS, type TodoItem } from '@/entities/todo';
import { useResponsive } from '@/shared/lib/hooks';
import { cn } from '@/shared/lib/utils';
import { Button, Checkbox, ConfirmActions, Input } from '@/shared/ui';

interface ItemRowProps {
	item: TodoItem;
	actionsOpen: boolean;
	onActionsClose: () => void;
	onActionsToggle: () => void;
}

export const ItemRow = observer(({ item, actionsOpen, onActionsClose, onActionsToggle }: ItemRowProps) => {
	const { isMobile } = useResponsive();

	const { todoStore } = useStore();

	const [isEditing, setIsEditing] = useState(false);
	const [draftText, setDraftText] = useState(item.text);

	const handleEdit = () => {
		onActionsClose();
		setDraftText(item.text);
		setIsEditing(true);
	};

	const handleCancel = () => {
		setIsEditing(false);
		setDraftText(item.text);
	};

	const handleSave = async () => {
		const text = draftText.trim();
		if (!text || todoStore.isLoading) return;

		if (text === item.text) {
			handleCancel();
			return;
		}

		const success = await todoStore.updateItem(item.id, { text });
		if (success) setIsEditing(false);
	};

	const handleDelete = () => {
		onActionsClose();
		void todoStore.deleteItem(item.id);
	};

	return (
		<li
			className={cn(
				'group/item flex min-w-0 items-center gap-2 rounded-lg py-px xl:px-2',
				!isEditing && 'py-1 transition-colors hover:bg-(--tone-hover)'
			)}
			data-item-id={item.id}
		>
			{isEditing ? (
				<>
					<Input
						autoFocus
						aria-label="Текст пункта"
						className="min-w-0 flex-1 border border-(--border-contrast)/15 py-0.5 text-sm"
						disabled={todoStore.isLoading}
						maxLength={TODO_LIMITS.ITEM_TEXT}
						value={draftText}
						onChange={(event) => setDraftText(event.target.value)}
						onKeyDown={(event) => {
							if (event.nativeEvent.isComposing) return;
							if (event.key === 'Enter') {
								event.preventDefault();
								void handleSave();
							}
							if (event.key === 'Escape') handleCancel();
						}}
					/>
					<ConfirmActions
						confirmDisabled={!draftText.trim()}
						disabled={todoStore.isLoading}
						onCancel={handleCancel}
						onConfirm={() => void handleSave()}
					/>
				</>
			) : (
				<>
					<Checkbox
						aria-label={`Выполнено: ${item.text}`}
						checked={item.is_completed}
						className={
							todoStore.isLoading
								? 'pointer-events-none'
								: 'group-hover/item:[&_svg]:text-(--accent-primary)'
						}
						disabled={todoStore.isLoading}
						size={isMobile ? 'lg' : 'md'}
						onChange={(checked) => void todoStore.setItemCompleted(item.id, checked)}
					/>
					<span
						className={cn(
							'trim min-w-0 flex-1 text-sm break-all',
							item.is_completed && 'text-(--text-disabled) line-through'
						)}
					>
						{item.text}
					</span>
					<div className="flex shrink-0 gap-3 md:gap-2 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-focus-within/item:opacity-100 [@media(hover:hover)]:group-hover/item:opacity-100">
						{isMobile && !actionsOpen && (
							<Button
								aria-label={`Действия с пунктом «${item.text}»`}
								centerIcon={<IconDots className="size-6" />}
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
									centerIcon={<IconPencil className="size-6 md:size-4" />}
									disabled={todoStore.isLoading}
									padding="none"
									variant="icon"
									onClick={handleEdit}
								/>
								<Button
									aria-label={`Удалить «${item.text}»`}
									centerIcon={
										isMobile ? (
											<IconTrash className="size-6 md:size-4" />
										) : (
											<IconX className="size-6 md:size-4" />
										)
									}
									disabled={todoStore.isLoading}
									padding="none"
									variant="icon"
									onClick={handleDelete}
								/>
							</>
						)}
					</div>
				</>
			)}
		</li>
	);
});
