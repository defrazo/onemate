import { type ReactNode, useEffect, useRef, useState } from 'react';
import { IconLayoutGrid, IconPlus } from '@tabler/icons-react';
import { observer } from 'mobx-react-lite';

import { useStore } from '@/app/providers';
import { TODO_LIMITS, type TodoList } from '@/entities/todo';
import { usePageTitle } from '@/shared/lib/hooks';
import { Button, ConfirmDialog, LoadingError, NoContent, SyncIndicator, WorkspaceTabs } from '@/shared/ui';

import { Board, ListDialog } from './components';

export const TodoPage = observer(() => {
	usePageTitle('ToDo');

	const { modalStore, todoStore, userStore } = useStore();

	const [editingId, setEditingId] = useState<string>();
	const [draft, setDraft] = useState('');
	const [validation, setValidation] = useState<string | null>(null);

	const ownedModal = useRef<ReactNode>(null);
	const active = useRef(false);

	useEffect(() => {
		active.current = true;

		return () => {
			active.current = false;
			if (ownedModal.current && modalStore.modal?.content === ownedModal.current) modalStore.closeModal();
		};
	}, [modalStore, todoStore]);

	const canvas = todoStore.activeCanvas;

	const openModal = (content: ReactNode) => {
		ownedModal.current = content;
		modalStore.setModal(content);
	};

	const handleSave = async (operation: () => Promise<boolean>): Promise<boolean> => {
		if (todoStore.isLoading) return false;

		const userId = userStore.id;
		const success = await operation();

		return success && active.current && userStore.id === userId;
	};

	const handleSelectCanvas = (id: string) => {
		todoStore.setSelectedCanvas(id);
		setEditingId(undefined);
		setValidation(null);
	};

	const handleCreateCanvas = () =>
		openModal(
			<ListDialog
				maxLength={TODO_LIMITS.CANVAS_TITLE}
				mode="canvas"
				title="Новый холст"
				onClose={modalStore.closeModal}
				onSubmit={async (title) => {
					const ids = new Set(todoStore.canvases.map((entry) => entry.id));
					if (!(await handleSave(() => todoStore.createCanvas(title)))) return false;
					const created = todoStore.canvases.find((entry) => !ids.has(entry.id));
					if (created) handleSelectCanvas(created.id);
					return true;
				}}
			/>
		);

	const handleStartRename = (id: string) => {
		const target = todoStore.canvases.find((entry) => entry.id === id);
		if (!target) return;

		setDraft(target.title);
		setEditingId(id);
		setValidation(null);
	};

	const handleRenameCanvas = async () => {
		if (!editingId || todoStore.isLoading) return;

		if (!draft.trim()) {
			setValidation('Введите название холста');
			return;
		}

		if (await handleSave(() => todoStore.renameCanvas(editingId, draft.trim()))) {
			setEditingId(undefined);
			setValidation(null);
		}
	};

	const handleCancelRename = () => {
		setEditingId(undefined);
		setValidation(null);
	};

	const handleDeleteCanvas = (id: string) => {
		if (todoStore.canvases.length <= 1) return;

		const target = todoStore.canvases.find((entry) => entry.id === id);
		if (!target) return;

		openDeleteDialog('Удаление холста', `Удалить холст «${target.title}»?`, () => todoStore.deleteCanvas(id));
	};

	const handleDeleteList = (list: TodoList) => {
		openDeleteDialog('Удаление списка', `Удалить список «${list.title}»?`, () => todoStore.deleteList(list.id));
	};

	const openListDialog = (list?: TodoList) => {
		if (!canvas) return;

		openModal(
			<ListDialog
				canvasId={list ? canvas.id : undefined}
				canvases={todoStore.canvases.map((entry) => ({
					id: entry.id,
					title: entry.title,
					disabled: entry.id !== canvas.id && entry.lists.length >= TODO_LIMITS.LISTS,
				}))}
				initialColor={list?.color}
				initialTitle={list?.title}
				maxLength={TODO_LIMITS.LIST_TITLE}
				mode="list"
				title={list ? 'Редактировать список' : 'Новый список'}
				onClose={modalStore.closeModal}
				onSubmit={(title, color, targetCanvasId) =>
					handleSave(() =>
						list
							? todoStore.updateList(list.id, {
									title,
									color,
									...(targetCanvasId && targetCanvasId !== canvas.id
										? { canvas_id: targetCanvasId }
										: {}),
								})
							: todoStore.createList(canvas.id, title, color)
					)
				}
			/>
		);
	};

	const openDeleteDialog = (title: string, description: string, operation: () => Promise<boolean>) => {
		openModal(
			<ConfirmDialog
				confirmLabel="Удалить"
				description={description}
				title={title}
				variant="danger"
				onCancel={modalStore.closeModal}
				onConfirm={async () => {
					if (todoStore.isLoading) return;

					const success = await handleSave(operation);
					if (success) modalStore.closeModal();
				}}
			/>
		);
	};

	if (!todoStore.isReady)
		return <LoadingError message="Что-то пошло не так..." size="xl" onRetry={() => void todoStore.reload()} />;

	return (
		<section className="flex min-h-0 min-w-0 flex-1 flex-col gap-4">
			<WorkspaceTabs
				activeId={canvas?.id}
				canCreate={todoStore.canvases.length < TODO_LIMITS.CANVASES}
				canDelete={todoStore.canvases.length > 1}
				createLabel="Добавить холст"
				disabled={todoStore.isLoading}
				editValue={draft}
				editingId={editingId}
				items={todoStore.canvases}
				label="Холсты ToDo"
				maxItems={TODO_LIMITS.CANVASES}
				maxTitleLength={TODO_LIMITS.CANVAS_TITLE}
				saving={todoStore.isLoading}
				onCreate={handleCreateCanvas}
				onDelete={handleDeleteCanvas}
				onEditCancel={handleCancelRename}
				onEditChange={setDraft}
				onEditConfirm={() => void handleRenameCanvas()}
				onRename={handleStartRename}
				onSelect={handleSelectCanvas}
			/>
			{validation && (
				<p className="text-sm text-(--status-error)" role="alert">
					{validation}
				</p>
			)}
			{canvas && (
				<>
					<div className="flex items-center justify-between gap-3">
						<div className="flex cursor-default items-center gap-3">
							<div className="flex items-center justify-center rounded-lg bg-(--accent-primary-muted) px-3 py-1.5 text-sm text-(--accent-primary) select-none">
								{canvas.lists.length} / {TODO_LIMITS.LISTS} списков
							</div>
							{todoStore.isLoading && <SyncIndicator className="static bg-transparent" />}
						</div>
						{canvas.lists.length < TODO_LIMITS.LISTS && (
							<Button
								className="h-8 text-sm"
								disabled={todoStore.isLoading || canvas.lists.length >= TODO_LIMITS.LISTS}
								leftIcon={<IconPlus className="size-4" />}
								variant="accent"
								onClick={() => openListDialog()}
							>
								Добавить список
							</Button>
						)}
					</div>
					<div className="@container flex min-h-0 min-w-0 flex-1 flex-col overflow-auto">
						{canvas.lists.length === 0 ? (
							<div className="flex min-h-0 flex-1 items-center justify-center">
								<NoContent
									description="Добавьте список, чтобы начать планирование"
									icon={IconLayoutGrid}
									title="Холст пуст"
								/>
							</div>
						) : (
							<Board
								key={`${userStore.id}:${canvas.id}`}
								canvas={canvas}
								onDelete={handleDeleteList}
								onEdit={openListDialog}
							/>
						)}
					</div>
				</>
			)}
		</section>
	);
});
