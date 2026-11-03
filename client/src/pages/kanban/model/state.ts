import { BoardRevisionConflictError } from '../api';
import { boardCache, MESSAGES, notifier, now } from '../lib';
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
	let loadError = false;
	let conflict: { boardId: string; currentRevision: number } | null = null;
	let generation = 0;
	let selectionIntent = 0;
	let writeVersion = 0;

	const queues = new Map<string, Promise<void>>();
	const cached = boardCache.get();
	const snapshots = new Map<string, KanbanSnapshot>(cached?.snapshots ?? []);

	if (cached) {
		boards = cached.boards.map((board) => ({ ...board }));
		activeBoardId = cached.activeBoardId;
	}

	const saveCache = () => {
		if (destroyed || !activeBoardId || conflict) return;
		if (!snapshots.has(activeBoardId)) return;

		boardCache.set(boards, activeBoardId, snapshots);
	};
	const boardListeners = new Set<() => void>();

	// === BOARDS ===
	const getBoardState = () => ({
		boards: boards.map((board) => ({ ...board })),
		activeBoardId,
		revision,
		loading,
		switching,
		savingBoard,
		loadError,
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

	const enqueue = (operation: (context: WriteContext) => Promise<void>) => {
		const token = generation;
		const boardId = activeBoardId;

		if (destroyed || loading || !boardId || conflict || revision === null) return Promise.resolve();

		writeVersion++;

		const current = () => !destroyed && token === generation && activeBoardId === boardId;

		const pending = (queues.get(boardId) ?? Promise.resolve()).then(async () => {
			if (!current() || loading || conflict || revision === null) return;
			await operation({ boardId, revision, current });
		});

		queues.set(
			boardId,
			pending.catch(() => {})
		);

		return pending;
	};

	const recordConflict = (error: unknown) => {
		if (error instanceof BoardRevisionConflictError && activeBoardId) {
			conflict = { boardId: activeBoardId, currentRevision: error.currentRevision };
			notifyBoards();
		}
	};

	const applySnapshot = (snapshot: KanbanSnapshot, current: () => boolean) => {
		if (!current() || snapshot.board.id !== activeBoardId) return;

		columns = snapshot.columns.map((column) => ({ ...column }));
		tasks = snapshot.tasks.map((task) => ({ ...task }));
		revision = snapshot.board.revision;
		conflict = null;

		boards = boards.map((board) => (board.id === snapshot.board.id ? { ...snapshot.board } : board));
		snapshots.set(snapshot.board.id, structuredClone(snapshot));
		saveCache();

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

	const fetchColumns = () => reloadBoard();

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

				const result = await repo.addColumn(context.boardId, context.revision, {
					title,
					color,
					taskLimit,
					position,
				});

				if (!context.current()) return;

				applySnapshot(result, context.current);
			} catch (error: unknown) {
				if (!context.current()) return;

				recordConflict(error);
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
					await repo.editColumn(context.boardId, context.revision, id, { title, color, taskLimit }),
					context.current
				);
			} catch (error: unknown) {
				if (!context.current()) return;

				recordConflict(error);
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
				if (columns.length <= LIMITS.MIN_COLUMNS) {
					notifier.setNotice(MESSAGES.columns.deleteLimit, 'info');
					return;
				}

				columns = columns.filter((column) => column.id !== id);

				notifyColumns();
				if (!context.current()) return;

				applySnapshot(await repo.deleteColumn(context.boardId, context.revision, id), context.current);

				if (!context.current()) return;

				notifier.setNotice(MESSAGES.columns.deleted, 'success');
			} catch (error: unknown) {
				if (!context.current()) return;

				recordConflict(error);
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
					await repo.reorderColumns(
						context.boardId,
						context.revision,
						columns.map((item) => item.id)
					),
					context.current
				);
			} catch (error: unknown) {
				if (!context.current()) return;

				recordConflict(error);
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

	const fetchTasks = () => reloadBoard();

	const addTask = (
		columnId: string,
		title: string,
		description: string,
		status: TaskStatus | null,
		priority: TaskPriority | null,
		startDate: string | null,
		endDate: string | null,
		completed: boolean,
		_taskLimit: number | null
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

				const result = await repo.addTask(context.boardId, context.revision, {
					columnId,
					title,
					description,
					status,
					priority,
					startDate,
					endDate,
					completed,
					position,
				});

				if (!context.current()) return;

				applySnapshot(result, context.current);
			} catch (error: unknown) {
				if (!context.current()) return;

				recordConflict(error);
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
		completed?: boolean
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
					updatedAt,
				};

				tasks = tasks.map((task) => (task.id === id ? { ...task, ...changes } : task));

				notifyTasks();
				if (!context.current()) return;

				applySnapshot(await repo.editTask(context.boardId, context.revision, id, changes), context.current);
			} catch (error: unknown) {
				if (!context.current()) return;

				recordConflict(error);
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

				applySnapshot(await repo.deleteTask(context.boardId, context.revision, id), context.current);

				if (!context.current()) return;

				notifier.setNotice(MESSAGES.tasks.deleted, 'success');
			} catch (error: unknown) {
				if (!context.current()) return;

				recordConflict(error);
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
					await repo.moveTask(context.boardId, context.revision, id, newColumnId, position),
					context.current
				);
			} catch (error: unknown) {
				if (!context.current()) return;

				recordConflict(error);
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
		conflict = conflict?.boardId === boardId ? conflict : null;
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

	const selectBoard = async (boardId: string) => {
		if (destroyed || (activeBoardId === boardId && !loadError && !conflict)) return;

		const intent = ++selectionIntent;
		const previousId = activeBoardId;

		if (previousId) await queues.get(previousId);
		if (destroyed || intent !== selectionIntent) return;

		const cached = snapshots.get(boardId);

		if (!cached) {
			const current = beginLoad(boardId);

			try {
				applySnapshot(await repo.fetchBoard(boardId), current);
			} catch (error: unknown) {
				if (current()) {
					loadError = true;
					throw error;
				}
			} finally {
				finishLoad(current);
			}

			return;
		}

		const token = ++generation;

		activeBoardId = boardId;
		loading = false;
		switching = false;
		loadError = false;
		conflict = null;
		isMovingTask = false;
		isMovingColumn = false;

		const current = () => !destroyed && token === generation && activeBoardId === boardId;

		applySnapshot(cached, current);

		const version = writeVersion;

		try {
			const snapshot = await repo.fetchBoard(boardId);

			if (!current() || version !== writeVersion || conflict) return;
			if (snapshot.board.revision <= (revision ?? -1)) return;

			applySnapshot(snapshot, current);
		} catch {
			if (current()) notifier.setNotice('Не удалось проверить актуальность доски', 'error');
		}
	};

	const reloadBoard = async () => {
		if (!activeBoardId) return loadData();

		const boardId = activeBoardId;

		++selectionIntent;
		await queues.get(boardId);

		if (destroyed || activeBoardId !== boardId) return;

		const current = beginLoad(boardId);

		try {
			applySnapshot(await repo.fetchBoard(boardId), current);
		} catch (error: unknown) {
			if (current()) {
				loadError = true;
				throw error;
			}
		} finally {
			finishLoad(current);
		}
	};

	const preloadBoards = async (current: () => boolean) => {
		const missing = boards.filter((board) => !snapshots.has(board.id));

		await Promise.all(
			missing.map(async (board) => {
				try {
					const snapshot = await repo.fetchBoard(board.id);

					if (!current()) return;
					if (!boards.some((item) => item.id === board.id)) return;

					snapshots.set(board.id, structuredClone(snapshot));
					saveCache();
				} catch {}
			})
		);
	};

	const loadData = async () => {
		if (destroyed) return;

		const intent = ++selectionIntent;
		const cachedSnapshot = activeBoardId ? snapshots.get(activeBoardId) : null;

		if (cachedSnapshot) {
			const token = ++generation;
			const current = () => !destroyed && token === generation && intent === selectionIntent;

			loading = false;
			switching = false;
			loadError = false;

			applySnapshot(cachedSnapshot, current);

			void (async () => {
				try {
					const result = await repo.fetchBoards();
					if (!current()) return;

					boards = result.boards.map((board) => ({ ...board }));

					const ids = new Set(boards.map((board) => board.id));

					for (const id of snapshots.keys()) {
						if (!ids.has(id)) snapshots.delete(id);
					}

					if (!activeBoardId || !ids.has(activeBoardId)) {
						const nextId = boards[0]?.id;

						if (nextId) await selectBoard(nextId);
						else await loadDataWithoutCache();

						return;
					}

					notifyBoards();

					const boardId = activeBoardId;
					const version = writeVersion;
					const snapshot = await repo.fetchBoard(boardId);

					if (!current() || boardId !== activeBoardId || version !== writeVersion) return;

					if (snapshot.board.revision > (revision ?? -1)) {
						applySnapshot(snapshot, current);
						saveCache();
					}

					saveCache();
					void preloadBoards(current);
				} catch {
					if (current()) notifier.setNotice('Не удалось проверить актуальность досок', 'error');
				}
			})();

			return;
		}

		await loadDataWithoutCache();
	};

	const loadDataWithoutCache = async () => {
		if (destroyed) return;

		const current = beginLoad(null);

		try {
			const result = await repo.fetchBoards();
			if (!current()) return;

			boards = result.boards.map((board) => ({ ...board }));

			let snapshot: KanbanSnapshot;

			if (boards.length === 0) {
				snapshot = await repo.initialize();
				if (!current()) return;

				boards = [{ ...snapshot.board }];
			} else snapshot = await repo.fetchBoard(boards[0].id);

			if (!current()) return;

			activeBoardId = snapshot.board.id;
			applySnapshot(snapshot, current);

			void preloadBoards(current);
		} catch (error: unknown) {
			if (current()) {
				loadError = true;
				throw error;
			}
		} finally {
			finishLoad(current);
		}
	};

	// === BOARD ===
	const runBoardOperation = async (operation: (context: WriteContext) => Promise<boolean>): Promise<boolean> => {
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

					recordConflict(error);

					if (context.current()) {
						notifier.setNotice(
							error instanceof BoardRevisionConflictError
								? 'Доска изменилась. Обновите доску'
								: error instanceof Error
									? error.message
									: 'Не удалось выполнить операцию',
							'error'
						);
					}
				}
			});
		} finally {
			savingBoard = false;
			notifyBoards();
		}

		return success && !destroyed;
	};

	const validBoardTitle = (title: string) => {
		if (!title || [...title].length > LIMITS.BOARD_TITLE) {
			throw new Error('Название: от 1 до 30 символов');
		}

		return true;
	};

	const createBoard = (title: string) =>
		runBoardOperation(async (context) => {
			title = title.trim();

			if (!validBoardTitle(title) || boards.length >= LIMITS.MAX_BOARDS) throw new Error('Нельзя создать доску');

			const snapshot = await repo.createBoard(title);
			if (!context.current()) return false;

			boards = [...boards, { ...snapshot.board }];

			const current = beginLoad(snapshot.board.id);

			applySnapshot(snapshot, current);
			finishLoad(current);

			return current();
		});

	const renameBoard = async (id: string, title: string): Promise<boolean> => {
		if (destroyed || savingBoard || loading || conflict) return false;

		const target = boards.find((board) => board.id === id);
		if (!target) return false;

		savingBoard = true;
		writeVersion++;
		notifyBoards();

		try {
			title = title.trim();
			validBoardTitle(title);

			await queues.get(id);

			if (destroyed) return false;

			const board = boards.find((item) => item.id === id);
			if (!board) return false;

			const boardRevision = id === activeBoardId ? revision : board.revision;
			if (boardRevision === null) return false;

			const snapshot = await repo.renameBoard(id, boardRevision, title);

			if (destroyed) return false;

			boards = boards.map((item) => (item.id === id ? { ...snapshot.board } : item));

			const cached = snapshots.get(id);

			if (cached) snapshots.set(id, { ...cached, board: { ...snapshot.board } });

			if (activeBoardId === id) revision = snapshot.board.revision;

			saveCache();
			notifyBoards();
			return true;
		} catch (error: unknown) {
			if (destroyed) return false;

			if (error instanceof BoardRevisionConflictError) {
				if (activeBoardId === id) recordConflict(error);

				notifier.setNotice('Доска изменилась. Обновите данные', 'error');
			} else {
				notifier.setNotice(error instanceof Error ? error.message : 'Не удалось переименовать доску', 'error');
			}

			return false;
		} finally {
			savingBoard = false;

			if (!destroyed) notifyBoards();
		}
	};

	const deleteBoard = async (id: string): Promise<boolean> => {
		if (destroyed || savingBoard || loading || conflict || boards.length <= 1) return false;

		const target = boards.find((board) => board.id === id);
		if (!target) return false;

		savingBoard = true;
		writeVersion++;
		notifyBoards();

		try {
			await queues.get(id);

			if (destroyed) return false;

			const board = boards.find((item) => item.id === id);
			if (!board) return false;

			const boardRevision = id === activeBoardId ? revision : board.revision;
			if (boardRevision === null) return false;

			await repo.deleteBoard(id, boardRevision);

			if (destroyed) return false;

			boards = boards.filter((item) => item.id !== id);
			snapshots.delete(id);
			queues.delete(id);

			if (activeBoardId === id) {
				try {
					await selectBoard(boards[0].id);
				} catch {
					if (!destroyed) notifier.setNotice('Не удалось загрузить доску', 'error');
				}
			} else {
				notifyBoards();
			}

			return !destroyed;
		} catch (error: unknown) {
			if (destroyed) return false;

			if (error instanceof BoardRevisionConflictError) {
				if (activeBoardId === id) recordConflict(error);

				notifier.setNotice('Доска изменилась. Обновите данные', 'error');
			} else {
				notifier.setNotice(error instanceof Error ? error.message : 'Не удалось удалить доску', 'error');
			}

			return false;
		} finally {
			savingBoard = false;

			if (!destroyed) notifyBoards();
		}
	};

	// === CLEANUP ===
	const destroy = () => {
		if (destroyed) return;

		destroyed = true;
		generation++;
		selectionIntent++;

		boardListeners.clear();
		columnListeners.clear();
		taskListeners.clear();

		queues.clear();
		snapshots.clear();
	};

	return {
		destroy,
		loadData,
		createBoard,
		renameBoard,
		deleteBoard,
		selectBoard,
		reloadBoard,
		getBoardState,
		subscribeBoards,

		fetchColumns,
		fetchTasks,

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
