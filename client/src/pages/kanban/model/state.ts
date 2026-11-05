import { isAxiosError } from 'axios';

import { BoardRevisionConflictError } from '../api';
import { MESSAGES, notifier, now } from '../lib';
import type { Column, ColumnColor, IKanbanRepo, KanbanBoard, KanbanSnapshot, Task, TaskPriority, TaskStatus } from '.';
import { LIMITS } from '.';

type ColumnListener = (columns: Column[]) => void;
type TaskListener = (tasks: Task[]) => void;

const rollback = <T>(snapshot: T, restore: (snapshot: T) => void, notify: () => void) => {
	restore(snapshot);
	notify();
};

export const createState = (repo: IKanbanRepo) => {
	let destroyed = false;
	let isMovingTask = false;
	let isMovingColumn = false;

	let boards: KanbanBoard[] = [];
	let activeBoardId: string | null = null;
	let revision: number | null = null;
	let loading = false;
	let switching = false;
	let savingBoard = false;
	let pendingWrites = 0;
	let loadError = false;
	let conflict: { boardId: string; currentRevision: number } | null = null;
	let generation = 0;
	const queues = new Map<string, Promise<void>>();
	const snapshots = new Map<string, KanbanSnapshot>();
	const conflicts = new Map<string, { boardId: string; currentRevision: number }>();
	const editors = new Set<() => void>();
	const boardListeners = new Set<() => void>();

	// === BOARDS ===
	const getBoardState = () => ({
		boards: boards.map((board) => ({ ...board })),
		activeBoardId,
		revision,
		loading,
		switching,
		savingBoard,
		isSyncing: pendingWrites > 0,
		loadError,
		hasOpenEditor: editors.size > 0,
		canCreateBoard: boards.length < LIMITS.MAX_BOARDS,
		canDeleteBoard: boards.length > 1,
		conflict: conflict ? { ...conflict } : null,
	});

	const notifyBoards = () => {
		const token = generation;
		boardListeners.forEach((listener) => {
			if (!destroyed && token === generation) listener();
		});
	};

	const subscribeBoards = (listener: () => void) => {
		if (destroyed) return () => {};
		boardListeners.add(listener);
		listener();
		return () => boardListeners.delete(listener);
	};

	// === WRITES ===
	type WriteContext = { boardId: string; revision: number; current: () => boolean };

	const enqueue = (
		operation: (context: WriteContext) => Promise<boolean | void>,
		boardId = activeBoardId
	): Promise<boolean> => {
		const token = generation;

		if (destroyed || loading || !boardId || conflicts.has(boardId)) return Promise.resolve(false);

		const current = () => !destroyed && token === generation && boards.some((board) => board.id === boardId);

		const pending = (queues.get(boardId) ?? Promise.resolve()).then(async () => {
			if (!current() || loading || conflicts.has(boardId)) return false;

			const latest = snapshots.get(boardId);

			if (boardId === activeBoardId && latest && latest.board.revision > (revision ?? -1))
				applySnapshot(latest, current, true);

			if (!current()) return false;

			const currentRevision =
				boardId === activeBoardId
					? revision
					: (latest?.board.revision ?? boards.find((board) => board.id === boardId)?.revision);

			if (currentRevision === null || currentRevision === undefined) return false;
			return (await operation({ boardId, revision: currentRevision, current })) === true;
		});
		pendingWrites++;
		notifyBoards();

		const tracked = pending.finally(() => {
			pendingWrites--;
			notifyBoards();
		});

		queues.set(
			boardId,
			tracked.then(
				() => {},
				() => {}
			)
		);

		return tracked;
	};

	const registerEditor = (close: () => void) => {
		if (destroyed) {
			close();
			return () => {};
		}

		editors.add(close);
		notifyBoards();

		return () => {
			editors.delete(close);
			notifyBoards();
		};
	};

	const closeEditors = () => {
		for (const close of [...editors]) close();
		editors.clear();
	};

	const recordConflict = (error: unknown, boardId = activeBoardId) => {
		if (error instanceof BoardRevisionConflictError && boardId) {
			const value = { boardId, currentRevision: error.currentRevision };
			conflicts.set(boardId, value);

			if (activeBoardId === boardId) conflict = value;
			notifyBoards();
		}
	};

	const discardUnavailable = (error: unknown, boardId = activeBoardId) => {
		if (destroyed || !isAxiosError(error) || ![403, 404].includes(error.response?.status ?? 0)) return false;

		if (!boardId) {
			generation++;
			closeEditors();
			snapshots.clear();
			conflicts.clear();
			boards = [];
			columns = [];
			tasks = [];
			revision = null;
			activeBoardId = null;
			conflict = null;
			loading = false;
			switching = false;
			loadError = true;
			notifyColumns();
			notifyTasks();
			notifyBoards();
			return true;
		}

		snapshots.delete(boardId);
		conflicts.delete(boardId);

		boards = boards.filter((board) => board.id !== boardId);

		if (activeBoardId === boardId) {
			generation++;
			closeEditors();
			columns = [];
			tasks = [];
			revision = null;
			activeBoardId = null;
			conflict = null;
			loading = false;
			switching = false;
			loadError = true;
			notifyColumns();
			notifyTasks();
		}

		notifyBoards();

		return true;
	};

	const receiveWrite = async (context: WriteContext, request: Promise<KanbanSnapshot>) => {
		try {
			const snapshot = await request;

			if (
				!destroyed &&
				snapshot.board.id === context.boardId &&
				boards.some((board) => board.id === context.boardId) &&
				snapshot.board.revision >= (snapshots.get(context.boardId)?.board.revision ?? -1)
			) {
				snapshots.set(context.boardId, structuredClone(snapshot));
				boards = boards.map((board) => (board.id === context.boardId ? { ...snapshot.board } : board));
				if (
					!context.current() &&
					activeBoardId === context.boardId &&
					!loading &&
					snapshot.board.revision > (revision ?? -1)
				) {
					const token = generation;
					applySnapshot(
						snapshot,
						() => !destroyed && generation === token && activeBoardId === context.boardId,
						true
					);
				}
			}
			return snapshot;
		} catch (error: unknown) {
			discardUnavailable(error, context.boardId);
			throw error;
		}
	};

	const applySnapshot = (snapshot: KanbanSnapshot, current: () => boolean, cached = false) => {
		if (!current()) return;

		const id = snapshot.board.id;
		const known = snapshots.get(id);

		if (known && snapshot.board.revision < known.board.revision) {
			if (id === activeBoardId && revision === null) applySnapshot(known, current, true);
			return;
		}

		boards = boards.map((board) => (board.id === id ? { ...snapshot.board } : board));
		snapshots.set(id, structuredClone(snapshot));

		if (!cached) conflicts.delete(id);

		if (id !== activeBoardId) {
			notifyBoards();
			return;
		}

		columns = snapshot.columns.map((column) => ({ ...column }));
		tasks = snapshot.tasks.map((task) => ({ ...task }));
		revision = snapshot.board.revision;
		conflict = conflicts.get(id) ?? null;

		notifyColumns();

		if (!current()) return;

		notifyTasks();

		if (current()) notifyBoards();
	};

	// === COLUMNS ===
	let columns: Column[] = [];

	const columnListeners = new Set<ColumnListener>();

	const getColumns = () =>
		columns
			.slice()
			.sort((a, b) => a.position - b.position || a.id.localeCompare(b.id))
			.map((column) => ({ ...column }));

	const notifyColumns = () => {
		if (destroyed) return;

		const sorted = getColumns();
		const token = generation;

		columnListeners.forEach((listener) => {
			if (!destroyed && token === generation) listener(sorted);
		});
	};

	const addColumn = (title: string, color: ColumnColor, taskLimit: number | null) =>
		enqueue(async (context) => {
			if (!context.current()) return;

			const snapshot = columns.map((column) => ({ ...column }));

			try {
				if (title.length > LIMITS.COLUMN_TITLE) {
					notifier.setNotice(MESSAGES.columns.addTitleLimit, 'info');
					return;
				}

				if (columns.length >= LIMITS.MAX_COLUMNS) {
					notifier.setNotice(MESSAGES.columns.addLimit, 'info');
					return;
				}

				const position =
					columns.length > 0 ? Math.max(...columns.map((column) => column.position)) + 1000 : 1000;

				const result = await receiveWrite(
					context,
					repo.addColumn(context.boardId, context.revision, { title, color, taskLimit, position })
				);

				if (!context.current()) return;

				applySnapshot(result, context.current);
				return context.current();
			} catch (error: unknown) {
				if (!context.current()) return;

				if (discardUnavailable(error, context.boardId)) return false;

				recordConflict(error, context.boardId);

				if (!context.current()) return;

				notifier.setNotice(MESSAGES.columns.addError, 'error');
				rollback(snapshot, (snapshot) => (columns = snapshot), notifyColumns);
			}
		});

	const editColumn = (id: string, title: string, color: ColumnColor, taskLimit: number | null) =>
		enqueue(async (context) => {
			if (!context.current()) return;

			const snapshot = columns.map((column) => ({ ...column }));

			try {
				if (title.length > LIMITS.COLUMN_TITLE) {
					notifier.setNotice(MESSAGES.columns.updateTitleLimit, 'info');
					return;
				}

				columns = columns.map((column) => (column.id === id ? { ...column, title, color, taskLimit } : column));

				notifyColumns();
				if (!context.current()) return;

				applySnapshot(
					await receiveWrite(
						context,
						repo.editColumn(context.boardId, context.revision, id, { title, color, taskLimit })
					),
					context.current
				);
				return context.current();
			} catch (error: unknown) {
				if (!context.current()) return;

				if (discardUnavailable(error, context.boardId)) return false;

				recordConflict(error, context.boardId);

				if (!context.current()) return;

				notifier.setNotice(MESSAGES.columns.updateError, 'error');
				rollback(snapshot, (snapshot) => (columns = snapshot), notifyColumns);
			}
		});

	const deleteColumn = (id: string) =>
		enqueue(async (context) => {
			if (!context.current()) return;

			const snapshot = columns.map((column) => ({ ...column }));

			try {
				columns = columns.filter((column) => column.id !== id);

				notifyColumns();
				if (!context.current()) return;

				applySnapshot(
					await receiveWrite(context, repo.deleteColumn(context.boardId, context.revision, id)),
					context.current
				);

				if (!context.current()) return;

				notifier.setNotice(MESSAGES.columns.deleted, 'success');
				return context.current();
			} catch (error: unknown) {
				if (!context.current()) return;

				if (discardUnavailable(error, context.boardId)) return false;

				recordConflict(error, context.boardId);

				if (!context.current()) return;

				notifier.setNotice(MESSAGES.columns.deleteError, 'error');
				rollback(snapshot, (snapshot) => (columns = snapshot), notifyColumns);
			}
		});

	const moveColumn = (id: string, newIdx: number) =>
		enqueue(async (context) => {
			if (!context.current()) return;
			if (isMovingColumn) return;

			isMovingColumn = true;

			const snapshot = columns.map((column) => ({ ...column }));

			try {
				const sortedColumns = columns
					.slice()
					.sort((a, b) => a.position - b.position || a.id.localeCompare(b.id));

				const column = sortedColumns.find((column) => column.id === id);
				if (!column) return;

				const oldIdx = sortedColumns.findIndex((column) => column.id === id);
				if (oldIdx === -1) return;

				const withoutMoved = sortedColumns.filter((column) => column.id !== id);
				const clampedIdx = Math.max(0, Math.min(newIdx, withoutMoved.length));

				if (oldIdx === clampedIdx) return;

				const updated = [...withoutMoved];
				updated.splice(clampedIdx, 0, column);

				columns = updated.map((item, index) => ({ ...item, position: (index + 1) * 1000 }));

				notifyColumns();
				if (!context.current()) return;

				applySnapshot(
					await receiveWrite(
						context,
						repo.reorderColumns(
							context.boardId,
							context.revision,
							columns.map((item) => item.id)
						)
					),
					context.current
				);
				return context.current();
			} catch (error: unknown) {
				if (!context.current()) return;

				if (discardUnavailable(error, context.boardId)) return false;

				recordConflict(error, context.boardId);

				if (!context.current()) return;

				notifier.setNotice(MESSAGES.columns.moveError, 'error');
				rollback(snapshot, (snapshot) => (columns = snapshot), notifyColumns);
			} finally {
				if (context.current()) {
					isMovingColumn = false;
					notifyColumns();
				}
			}
		});

	const subscribeColumns = (listener: ColumnListener) => {
		if (destroyed) return () => {};

		columnListeners.add(listener);
		listener(getColumns());

		return () => columnListeners.delete(listener);
	};

	// === TASKS ===
	let tasks: Task[] = [];

	const taskListeners = new Set<TaskListener>();

	const getTasks = () => tasks.map((task) => ({ ...task }));

	const notifyTasks = () => {
		if (destroyed) return;

		const snapshot = getTasks();
		const token = generation;

		taskListeners.forEach((listener) => {
			if (!destroyed && token === generation) listener(snapshot);
		});
	};

	const addTask = (
		columnId: string,
		title: string,
		description: string,
		status: TaskStatus | null,
		priority: TaskPriority | null,
		startDate: string | null,
		endDate: string | null,
		completed: boolean,
		remindBeforeDays: number | null = null
	) =>
		enqueue(async (context) => {
			if (!context.current()) return;

			const snapshot = tasks.map((task) => ({ ...task }));

			try {
				if (title.length > LIMITS.TASK_TITLE) {
					notifier.setNotice(MESSAGES.tasks.addTitleLimit, 'info');
					return;
				}

				const column = columns.find((item) => item.id === columnId);
				if (!column) return;

				const taskLimit = column.taskLimit;
				const columnTasks = tasks.filter((task) => task.columnId === columnId);

				if (taskLimit !== null && columnTasks.length + 1 > taskLimit) {
					notifier.setNotice(MESSAGES.tasks.addLimit, 'error');
					return;
				}

				const position =
					columnTasks.length > 0 ? Math.max(...columnTasks.map((task) => task.position)) + 1000 : 1000;

				const result = await receiveWrite(
					context,
					repo.addTask(context.boardId, context.revision, {
						columnId,
						title,
						description,
						status,
						priority,
						startDate,
						endDate,
						remindBeforeDays,
						completed,
						position,
					})
				);

				if (!context.current()) return;

				applySnapshot(result, context.current);
				return context.current();
			} catch (error: unknown) {
				if (!context.current()) return;

				if (discardUnavailable(error, context.boardId)) return false;

				recordConflict(error, context.boardId);

				if (!context.current()) return;

				notifier.setNotice(MESSAGES.tasks.addError, 'error');
				rollback(snapshot, (snapshot) => (tasks = snapshot), notifyTasks);
			}
		});

	const editTask = (
		id: string,
		title: string,
		description: string,
		status: TaskStatus | null,
		priority: TaskPriority | null,
		startDate: string | null,
		endDate: string | null,
		completed?: boolean,
		remindBeforeDays?: number | null
	) =>
		enqueue(async (context) => {
			if (!context.current()) return;

			const snapshot = tasks.map((task) => ({ ...task }));

			try {
				if (title.length > LIMITS.TASK_TITLE) {
					notifier.setNotice(MESSAGES.tasks.updateTitleLimit, 'info');
					return;
				}

				const updatedAt = now();

				const changes = {
					title,
					description,
					status,
					priority,
					startDate,
					endDate,
					...(completed !== undefined && { completed }),
					...(remindBeforeDays !== undefined && { remindBeforeDays }),
					updatedAt,
				};

				tasks = tasks.map((task) => (task.id === id ? { ...task, ...changes } : task));

				notifyTasks();
				if (!context.current()) return;

				applySnapshot(
					await receiveWrite(context, repo.editTask(context.boardId, context.revision, id, changes)),
					context.current
				);

				return context.current();
			} catch (error: unknown) {
				if (!context.current()) return;

				if (discardUnavailable(error, context.boardId)) return false;

				recordConflict(error, context.boardId);

				if (!context.current()) return;

				notifier.setNotice(MESSAGES.tasks.updateError, 'error');
				rollback(snapshot, (snapshot) => (tasks = snapshot), notifyTasks);
			}
		});

	const deleteTask = (id: string) =>
		enqueue(async (context) => {
			if (!context.current()) return;

			const snapshot = tasks.map((task) => ({ ...task }));

			try {
				tasks = tasks.filter((task) => task.id !== id);

				notifyTasks();
				if (!context.current()) return;

				applySnapshot(
					await receiveWrite(context, repo.deleteTask(context.boardId, context.revision, id)),
					context.current
				);

				if (!context.current()) return;

				notifier.setNotice(MESSAGES.tasks.deleted, 'success');
				return context.current();
			} catch (error: unknown) {
				if (!context.current()) return;

				if (discardUnavailable(error, context.boardId)) return false;

				recordConflict(error, context.boardId);

				if (!context.current()) return;

				notifier.setNotice(MESSAGES.tasks.deleteError, 'error');
				rollback(snapshot, (snapshot) => (tasks = snapshot), notifyTasks);
			}
		});

	const moveTask = (id: string, newColumnId: string, newPosition?: number) =>
		enqueue(async (context) => {
			if (!context.current()) return;
			if (isMovingTask) return;

			const task = tasks.find((task) => task.id === id);
			if (!task || (task.columnId === newColumnId && newPosition === undefined)) return;

			const column = columns.find((column) => column.id === newColumnId);
			if (!column) return;

			const columnTasks = tasks.filter((task) => task.columnId === newColumnId);

			if (task.columnId !== newColumnId && column.taskLimit !== null && columnTasks.length >= column.taskLimit) {
				notifier.setNotice(MESSAGES.tasks.moveLimit, 'info');
				return;
			}

			isMovingTask = true;

			const snapshot = tasks.map((task) => ({ ...task }));

			try {
				const updatedAt = now();

				const position =
					newPosition ??
					(columnTasks.length ? Math.max(...columnTasks.map((task) => task.position)) + 1000 : 1000);

				tasks = tasks.map((item) =>
					item.id === id ? { ...item, columnId: newColumnId, position, updatedAt } : item
				);

				notifyTasks();
				if (!context.current()) return;

				applySnapshot(
					await receiveWrite(
						context,
						repo.moveTask(context.boardId, context.revision, id, newColumnId, position)
					),
					context.current
				);

				return context.current();
			} catch (error: unknown) {
				if (!context.current()) return;

				if (discardUnavailable(error, context.boardId)) return false;

				recordConflict(error, context.boardId);

				if (!context.current()) return;

				notifier.setNotice(MESSAGES.tasks.moveError, 'error');
				rollback(snapshot, (snapshot) => (tasks = snapshot), notifyTasks);
			} finally {
				if (context.current()) isMovingTask = false;
			}
		});

	const subscribeTasks = (listener: TaskListener) => {
		if (destroyed) return () => {};

		taskListeners.add(listener);
		listener(getTasks());

		return () => taskListeners.delete(listener);
	};

	// === LOAD ===
	const beginLoad = (boardId: string | null) => {
		const token = ++generation;

		switching = activeBoardId !== null && activeBoardId !== boardId;
		activeBoardId = boardId;
		revision = null;
		loading = true;
		loadError = false;
		conflict = boardId ? (conflicts.get(boardId) ?? null) : null;
		isMovingTask = false;
		isMovingColumn = false;

		columns = [];
		tasks = [];

		const current = () => !destroyed && token === generation;

		notifyColumns();
		if (current()) notifyTasks();
		if (current()) notifyBoards();

		return current;
	};

	const finishLoad = (current: () => boolean) => {
		if (!current()) return;

		loading = false;
		switching = false;
		notifyBoards();
	};

	const canLeaveEditor = () => {
		if (editors.size === 0) return true;

		notifier.setNotice(MESSAGES.boards.editorOpen, 'info');

		return false;
	};

	const selectBoard = async (boardId: string) => {
		if (destroyed || (activeBoardId === boardId && !loadError) || !canLeaveEditor()) return;

		const current = beginLoad(boardId);

		const cached = snapshots.get(boardId);
		if (cached) {
			applySnapshot(cached, current, true);
			finishLoad(current);
			return;
		}

		try {
			const pending = queues.get(boardId);

			if (pending) await pending;

			if (!current()) return;

			applySnapshot(await repo.fetchBoard(boardId), current);
		} catch (error: unknown) {
			const wasCurrent = current();

			discardUnavailable(error, boardId);

			if (wasCurrent) {
				loadError = true;
				throw error;
			}
		} finally {
			finishLoad(current);
		}
	};
	const reloadBoard = async () => {
		if (destroyed) return;
		if (!activeBoardId) return loadData();

		const boardId = activeBoardId;

		const current = beginLoad(boardId);

		try {
			await queues.get(boardId);

			if (current()) applySnapshot(await repo.fetchBoard(boardId), current);
		} catch (error: unknown) {
			const wasCurrent = current();

			discardUnavailable(error, boardId);

			if (wasCurrent) {
				loadError = true;
				throw error;
			}
		} finally {
			finishLoad(current);
		}
	};
	const loadData = async () => {
		if (destroyed || !canLeaveEditor()) return;

		const current = beginLoad(null);
		let requestedBoardId: string | null = null;

		try {
			const result = await repo.fetchBoards();

			if (!current()) return;

			boards = result.boards.map((board) => ({ ...board }));
			const ids = new Set(boards.map((board) => board.id));

			for (const id of snapshots.keys()) if (!ids.has(id)) snapshots.delete(id);

			requestedBoardId = boards[0]?.id ?? null;

			if (requestedBoardId) await queues.get(requestedBoardId);

			if (!current()) return;

			const snapshot = requestedBoardId ? await repo.fetchBoard(requestedBoardId) : await repo.initialize();

			if (!current()) return;

			if (!boards.length) boards = [{ ...snapshot.board }];

			activeBoardId = snapshot.board.id;
			applySnapshot(snapshot, current);
		} catch (error: unknown) {
			if (current()) {
				discardUnavailable(error, requestedBoardId);
				loadError = true;
				throw error;
			}
		} finally {
			finishLoad(current);
		}
	};

	// === BOARD ===
	const runBoardOperation = async (
		operation: (context: WriteContext) => Promise<boolean>,
		boardId = activeBoardId
	): Promise<boolean> => {
		if (destroyed || savingBoard || loading || conflict || revision === null) return false;

		savingBoard = true;
		notifyBoards();

		let success = false;

		try {
			await enqueue(async (context) => {
				try {
					success = await operation(context);
				} catch (error: unknown) {
					if (!context.current()) return;

					if (discardUnavailable(error, context.boardId)) return;
					recordConflict(error, context.boardId);

					if (context.current()) {
						notifier.setNotice(
							error instanceof BoardRevisionConflictError
								? MESSAGES.boards.revisionConflict
								: error instanceof Error
									? error.message
									: MESSAGES.boards.operationError,
							'error'
						);
					}
				}
			}, boardId);
		} finally {
			savingBoard = false;
			notifyBoards();
		}

		return success && !destroyed;
	};

	const validBoardTitle = (title: string) => {
		if (!title || [...title].length > LIMITS.BOARD_TITLE) throw new Error(MESSAGES.boards.titleLimit);
		return true;
	};

	const createBoard = (title: string) =>
		runBoardOperation(async (context) => {
			title = title.trim();

			if (!canLeaveEditor() || !validBoardTitle(title) || boards.length >= LIMITS.MAX_BOARDS)
				throw new Error(MESSAGES.boards.createError);

			const snapshot = await repo.createBoard(title);
			if (!context.current()) return false;

			boards = [...boards, { ...snapshot.board }];

			const current = beginLoad(snapshot.board.id);

			applySnapshot(snapshot, current);
			finishLoad(current);

			return current();
		});

	const renameBoard = (id: string, title: string) =>
		runBoardOperation(async (context) => {
			title = title.trim();
			validBoardTitle(title);

			const snapshot = await receiveWrite(context, repo.renameBoard(id, context.revision, title));

			if (!context.current()) return false;

			applySnapshot(snapshot, context.current);

			return true;
		}, id);

	const deleteBoard = async (id: string) => {
		if (editors.size && activeBoardId === id) {
			canLeaveEditor();
			return false;
		}

		let deleted = false;

		const success = await runBoardOperation(async (context) => {
			if (boards.length <= 1) return false;

			await repo.deleteBoard(id, context.revision);

			if (destroyed) return false;

			boards = boards.filter((board) => board.id !== id);
			snapshots.delete(id);
			conflicts.delete(id);
			deleted = activeBoardId === id;

			notifyBoards();

			return true;
		}, id);
		if (success && deleted && !destroyed) {
			try {
				await selectBoard(boards[0].id);
			} catch {
				if (!destroyed) notifier.setNotice(MESSAGES.boards.loadError, 'error');
			}
		}
		return success;
	};

	// === CLEANUP ===
	const destroy = () => {
		if (destroyed) return;

		destroyed = true;
		generation++;
		closeEditors();
		conflicts.clear();
		columns = [];
		tasks = [];
		boards = [];
		activeBoardId = null;
		revision = null;

		for (const listener of boardListeners) listener();
		boardListeners.clear();
		columnListeners.clear();
		taskListeners.clear();

		queues.clear();
		snapshots.clear();
	};

	return {
		destroy,
		registerEditor,
		loadData,
		createBoard,
		renameBoard,
		deleteBoard,
		selectBoard,
		reloadBoard,
		getBoardState,
		subscribeBoards,

		addColumn,
		editColumn,
		moveColumn,
		deleteColumn,

		addTask,
		editTask,
		moveTask,
		deleteTask,

		getColumns,
		getTasks,

		subscribeColumns,
		subscribeTasks,

		get isMovingColumn() {
			return isMovingColumn;
		},

		get isMovingTask() {
			return isMovingTask;
		},
	};
};
