import { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import { reaction } from 'mobx';

import { useStore } from '@/app/providers';
import { usePageTitle } from '@/shared/lib/hooks';
import { Button, LoadingError, WorkspaceTabs } from '@/shared/ui';

import { createSvg, deleteIcon, notifier } from '../lib';
import { LIMITS } from '../model';
import { initKanban } from '.';
import { createBoardDialog, createConfirmDialog } from './components';

type KanbanInstance = ReturnType<typeof initKanban>;

export const KanbanPage = () => {
	usePageTitle('Kanban');

	const { userStore } = useStore();

	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(false);
	const [editingId, setEditingId] = useState<string>();
	const [draft, setDraft] = useState('');

	const [, forceUpdate] = useReducer((value) => value + 1, 0);

	const kanbanRef = useRef<HTMLDivElement | null>(null);
	const instanceRef = useRef<KanbanInstance | null>(null);
	const cleanupRef = useRef<(() => void) | undefined>(undefined);
	const requestIdRef = useRef(0);

	const boardDialogRef = useRef<ReturnType<typeof createBoardDialog> | null>(null);
	const confirmDialogRef = useRef<ReturnType<typeof createConfirmDialog> | null>(null);

	// === INITIALIZATION ===
	const initialize = useCallback(async () => {
		const root = kanbanRef.current;
		if (!root) return;

		const requestId = ++requestIdRef.current;

		cleanupRef.current?.();
		cleanupRef.current = undefined;
		instanceRef.current = null;

		setLoading(true);
		setError(false);
		setEditingId(undefined);

		try {
			const instance = initKanban(root, userStore);
			instanceRef.current = instance;

			const unsubscribe = instance.state.subscribeBoards(forceUpdate);

			cleanupRef.current = () => {
				unsubscribe();
				instance.destroy();
			};

			await instance.ready;
		} catch {
			if (requestId === requestIdRef.current) setError(true);
		} finally {
			if (requestId === requestIdRef.current) setLoading(false);
		}
	}, [userStore]);

	useEffect(() => {
		void initialize();
		const stopSessionWatch = reaction(
			() => `${userStore.userRole}:${userStore.id ?? ''}`,
			() => {
				if (userStore.id) void initialize();
			}
		);

		return () => {
			stopSessionWatch();
			requestIdRef.current += 1;

			boardDialogRef.current?.close();
			boardDialogRef.current = null;

			confirmDialogRef.current?.close();
			confirmDialogRef.current = null;

			cleanupRef.current?.();
			cleanupRef.current = undefined;

			instanceRef.current = null;
		};
	}, [initialize, userStore]);

	// === STATE ===
	const instance = instanceRef.current;
	const state = instance?.state;
	const view = state?.getBoardState();

	const isCurrentInstance = (target: KanbanInstance) => instanceRef.current === target;

	// === BOARD SELECTION ===
	const selectBoard = (id: string) => {
		if (!instance) return;

		if (
			editingId &&
			draft !== instance.state.getBoardState().boards.find((board) => board.id === editingId)?.title
		) {
			notifier.setNotice('Сохраните или отмените переименование', 'info');
			return;
		}

		setEditingId(undefined);

		if (instance.state.getBoardState().activeBoardId === id) return;

		void instance.state.selectBoard(id).catch(() => {
			if (isCurrentInstance(instance)) notifier.setNotice('Не удалось загрузить доску', 'error');
		});
	};

	const reloadBoard = async () => {
		if (!instance) return;

		try {
			await instance.state.reloadBoard();
		} catch {
			if (isCurrentInstance(instance)) notifier.setNotice('Не удалось загрузить доску', 'error');
		}
	};

	// === BOARD CREATION ===
	const openCreateDialog = () => {
		if (!instance) return;

		boardDialogRef.current?.close();

		const dialog = createBoardDialog({ onSubmit: (title) => instance.state.createBoard(title) });

		boardDialogRef.current = dialog;
		document.body.append(dialog.element);
	};

	// === BOARD RENAMING ===
	const startRename = (id: string) => {
		if (!instance) return;

		const board = instance.state.getBoardState().boards.find((board) => board.id === id);
		if (!board) return;

		setDraft(board.title);
		setEditingId(id);
	};

	const confirmRename = async () => {
		if (!instance || !editingId) return;

		const success = await instance.state.renameBoard(editingId, draft);
		if (success && isCurrentInstance(instance)) setEditingId(undefined);
	};

	const cancelRename = () => {
		setEditingId(undefined);
	};

	// === BOARD DELETION ===
	const openDeleteDialog = (id: string) => {
		if (!instance) return;

		const board = instance.state.getBoardState().boards.find((board) => board.id === id);
		if (!board) return;

		confirmDialogRef.current?.close();

		const dialog = createConfirmDialog({
			title: 'Удаление доски',
			content: `Удалить доску «${board.title}» и все её задачи?`,
			icon: createSvg(deleteIcon, 'size-5'),
			confirmText: 'Удалить',
			onConfirm: () => void instance.state.deleteBoard(id),
		});

		confirmDialogRef.current = dialog;
		document.body.append(dialog.element);
	};

	// === RENDER ===
	const isLoading = loading || !!view?.loading;
	const hasError = error || !!view?.loadError;

	return (
		<section className="flex size-full min-h-0 min-w-0 flex-col gap-4">
			{view && (
				<div className="flex min-w-0 items-center gap-3">
					<div className="min-w-0 flex-1">
						<WorkspaceTabs
							activeId={view.activeBoardId ?? undefined}
							canCreate={view.canCreateBoard && !loading}
							canDelete={view.canDeleteBoard}
							createLabel="Добавить доску"
							disabled={isLoading || view.savingBoard || error}
							editValue={draft}
							editingId={editingId}
							items={view.boards}
							label="Доски Kanban"
							maxItems={LIMITS.MAX_BOARDS}
							maxTitleLength={LIMITS.BOARD_TITLE}
							saving={view.savingBoard}
							onCreate={openCreateDialog}
							onDelete={openDeleteDialog}
							onEditCancel={cancelRename}
							onEditChange={setDraft}
							onEditConfirm={() => void confirmRename()}
							onRename={startRename}
							onSelect={selectBoard}
						/>
					</div>
					{!view.conflict && (
						<Button disabled={isLoading || view.savingBoard || error} onClick={() => void reloadBoard()}>
							Обновить доску
						</Button>
					)}
				</div>
			)}
			{view?.conflict && (
				<div className="flex items-center justify-between gap-3 text-sm text-(--status-error)" role="alert">
					<span>Доска изменилась. Обновите её перед продолжением.</span>
					<Button disabled={view.loading} onClick={() => void reloadBoard()}>
						Обновить доску
					</Button>
				</div>
			)}
			<div aria-busy={isLoading} className="relative min-h-0 flex-1">
				<div
					ref={kanbanRef}
					className="size-full overflow-hidden"
					id="kanban"
					inert={!!(view?.conflict || isLoading)}
				/>
				{(isLoading || hasError) && (
					<div className="absolute inset-0 flex items-center justify-center">
						<LoadingError
							error={hasError}
							message="Не удалось загрузить доску"
							size="lg"
							onRetry={() => {
								if (error) void initialize();
								else void reloadBoard();
							}}
						/>
					</div>
				)}
			</div>
		</section>
	);
};
