import { beforeEach, describe, expect, it, vi } from 'vitest';

import { BoardRevisionConflictError } from '../api';
import { MESSAGES, notifier } from '../lib';
import type { IKanbanRepo, KanbanSnapshot, Task } from '.';
import { createState, getDefaultColumns, getDefaultTasks, sortTasks } from '.';

vi.mock('../lib/notifier', () => ({ notifier: { setNotice: vi.fn() } }));
const deferred = <T>() => {
	let resolve!: (value: T) => void;
	let reject!: (error: Error) => void;
	const promise = new Promise<T>((res, rej) => {
		resolve = res;
		reject = rej;
	});
	return { promise, resolve, reject };
};
const flush = async () => {
	await Promise.resolve();
	await Promise.resolve();
};
const createRepo = (ownerId = 'owner', withExistingSecondBoard = false): IKanbanRepo => {
	let sequence = 0;
	const data: KanbanSnapshot[] = [];
	const make = (title: string, populated = true) => {
		const id = `board-${++sequence}`;
		const columns = populated
			? getDefaultColumns().map((column, index) => ({ ...column, id: `${id}-c${index}` }))
			: [];
		const snapshot: KanbanSnapshot = {
			board: { id, ownerId, title, revision: 0, createdAt: null, updatedAt: null },
			columns,
			tasks: (populated ? getDefaultTasks(columns.map((column) => column.id)) : []).map((task, index) => ({
				...task,
				id: `${id}-t${index}`,
				createdAt: '2026-01-01',
				updatedAt: null,
			})),
		};
		snapshot.tasks.sort(
			(a, b) =>
				columns.findIndex((c) => c.id === a.columnId) - columns.findIndex((c) => c.id === b.columnId) ||
				a.position - b.position
		);
		data.push(snapshot);
		return structuredClone(snapshot);
	};
	const find = (id: string) => {
		const snapshot = data.find((item) => item.board.id === id);
		if (!snapshot) throw new Error('Missing board');
		return snapshot;
	};
	const change = (id: string, revision: number, operation: (snapshot: KanbanSnapshot) => void) => {
		const current = find(id);
		if (current.board.revision !== revision) throw new BoardRevisionConflictError(current.board.revision);
		const next = structuredClone(current);
		operation(next);
		next.board.revision++;
		next.columns.sort((a, b) => a.position - b.position);
		data[data.indexOf(current)] = next;
		return structuredClone(next);
	};
	make('First');
	if (withExistingSecondBoard) make('Second');
	return {
		fetchBoards: async () => ({ boards: data.map((item) => structuredClone(item.board)) }),
		initialize: async () => structuredClone(data[0]),
		fetchBoard: async (id) => structuredClone(find(id)),
		createBoard: async (title) => make(title, false),
		renameBoard: async (id, revision, title) =>
			change(id, revision, (next) => {
				next.board.title = title;
			}),
		deleteBoard: async (id, revision) => {
			change(id, revision, () => {});
			data.splice(data.indexOf(find(id)), 1);
			return { deleted_board_id: id };
		},
		addColumn: async (id, revision, column) =>
			change(id, revision, (next) => {
				next.columns.push({ ...column, id: `column-${++sequence}` });
			}),
		editColumn: async (id, revision, columnId, changes) =>
			change(id, revision, (next) => {
				Object.assign(
					next.columns.find((column) => column.id === columnId)!,
					changes
				);
			}),
		deleteColumn: async (id, revision, columnId) =>
			change(id, revision, (next) => {
				next.columns = next.columns.filter((column) => column.id !== columnId);
				next.tasks = next.tasks.filter((task) => task.columnId !== columnId);
			}),
		reorderColumns: async (id, revision, ids) =>
			change(id, revision, (next) => {
				next.columns = ids.map((columnId, index) => ({
					...next.columns.find((column) => column.id === columnId)!,
					position: (index + 1) * 1000,
				}));
			}),
		addTask: async (id, revision, task) =>
			change(id, revision, (next) => {
				next.tasks.push({ ...task, id: `task-${++sequence}`, createdAt: '2026-01-01', updatedAt: null });
			}),
		editTask: async (id, revision, taskId, changes) =>
			change(id, revision, (next) => {
				Object.assign(
					next.tasks.find((task) => task.id === taskId)!,
					changes
				);
			}),
		deleteTask: async (id, revision, taskId) =>
			change(id, revision, (next) => {
				next.tasks = next.tasks.filter((task) => task.id !== taskId);
			}),
		moveTask: async (id, revision, taskId, columnId, position) =>
			change(id, revision, (next) => {
				Object.assign(
					next.tasks.find((task) => task.id === taskId)!,
					{ columnId, position }
				);
			}),
	};
};
const setup = async () => {
	const repo = createRepo('owner', true);
	const first = await repo.initialize();
	const second = await repo.fetchBoard((await repo.fetchBoards()).boards[1].id);
	const state = createState(repo);
	await state.loadData();
	return { repo, state, first, second };
};
const edit = (state: ReturnType<typeof createState>, task: Task, title = task.title, completed?: boolean) =>
	state.editTask(
		task.id,
		title,
		task.description,
		task.status,
		task.priority,
		task.startDate,
		task.endDate,
		completed
	);
const add = (state: ReturnType<typeof createState>, column: string, title = 'Added') =>
	state.addTask(column, title, '', null, null, null, null, false);

beforeEach(() => vi.clearAllMocks());
describe('board loading and lifecycle', () => {
	it('selects the first board in server order on every opening', async () => {
		const { repo, state, first, second } = await setup();
		expect(state.getBoardState()).toMatchObject({
			activeBoardId: first.board.id,
			revision: 0,
			loading: false,
			switching: false,
			conflict: null,
		});
		expect(state.getBoardState().boards.map((board) => board.id)).toEqual([first.board.id, second.board.id]);
		await state.selectBoard(second.board.id);
		await state.loadData();
		expect(state.getBoardState().activeBoardId).toBe(first.board.id);
		const another = createState(repo);
		await another.loadData();
		expect(another.getBoardState().activeBoardId).toBe(first.board.id);
	});
	it('initializes only when the list is empty and uses the returned snapshot', async () => {
		const repo = createRepo();
		vi.spyOn(repo, 'fetchBoards').mockResolvedValue({ boards: [] });
		const initialize = vi.spyOn(repo, 'initialize');
		const read = vi.spyOn(repo, 'fetchBoard');
		const state = createState(repo);
		await state.loadData();
		expect(initialize).toHaveBeenCalledOnce();
		expect(read).not.toHaveBeenCalled();
		expect(state.getColumns()).toHaveLength(4);
		expect(state.getTasks()).toHaveLength(6);
	});
	it('does not initialize an existing empty board or create client defaults', async () => {
		const { repo, state, first } = await setup();
		const initialize = vi.spyOn(repo, 'initialize');
		const write = vi.spyOn(repo, 'addColumn');
		vi.spyOn(repo, 'fetchBoard').mockResolvedValue({ ...first, columns: [], tasks: [] });
		await state.reloadBoard();
		expect(state.getColumns()).toEqual([]);
		expect(state.getTasks()).toEqual([]);
		expect(initialize).not.toHaveBeenCalled();
		expect(write).not.toHaveBeenCalled();
	});
	it('clears old data during switching and applies both arrays before notifying', async () => {
		const { repo, state, second } = await setup();
		const pending = deferred<KanbanSnapshot>();
		vi.spyOn(repo, 'fetchBoard').mockReturnValue(pending.promise);
		const reading = state.selectBoard(second.board.id);
		expect(state.getColumns()).toEqual([]);
		expect(state.getTasks()).toEqual([]);
		expect(state.getBoardState()).toMatchObject({
			activeBoardId: second.board.id,
			loading: true,
			switching: true,
			revision: null,
		});
		const listener = vi.fn(() => {
			if (state.getColumns().length) expect(state.getTasks()).toEqual(second.tasks);
		});
		state.subscribeColumns(listener);
		pending.resolve(second);
		await reading;
		expect(state.getBoardState().loading).toBe(false);
		expect(state.getColumns()).toEqual(second.columns);
	});
	it.each(['resolve', 'reject'] as const)('ignores an old read after fast switching: %s', async (outcome) => {
		const { repo, state, first, second } = await setup();
		const pending = deferred<KanbanSnapshot>();
		vi.spyOn(repo, 'fetchBoard').mockReturnValueOnce(pending.promise).mockResolvedValueOnce(first);
		const old = state.selectBoard(second.board.id);
		await state.selectBoard(first.board.id);
		if (outcome === 'resolve') pending.resolve(second);
		else pending.reject(new Error('Late'));
		await old;
		expect(state.getBoardState()).toMatchObject({ activeBoardId: first.board.id, loading: false });
		expect(state.getTasks()).toEqual(first.tasks);
		expect(notifier.setNotice).not.toHaveBeenCalled();
	});
	it('stops initialization after a late list when destroyed', async () => {
		const repo = createRepo();
		const pending = deferred<{ boards: [] }>();
		vi.spyOn(repo, 'fetchBoards').mockReturnValue(pending.promise);
		const initialize = vi.spyOn(repo, 'initialize');
		const state = createState(repo);
		const loading = state.loadData();
		state.destroy();
		state.destroy();
		pending.resolve({ boards: [] });
		await loading;
		expect(initialize).not.toHaveBeenCalled();
		expect(state.getColumns()).toEqual([]);
	});
	it.each(['resolve', 'reject'] as const)('ignores a read after destroy: %s', async (outcome) => {
		const { repo, state, first } = await setup();
		const pending = deferred<KanbanSnapshot>();
		vi.spyOn(repo, 'fetchBoard').mockReturnValue(pending.promise);
		const loading = state.reloadBoard();
		await flush();
		const listener = vi.fn();
		state.subscribeColumns(listener);
		state.subscribeTasks(listener);
		state.subscribeBoards(listener);
		state.destroy();
		state.destroy();
		listener.mockClear();
		if (outcome === 'resolve') pending.resolve(first);
		else pending.reject(new Error('Late'));
		await loading;
		await state.loadData();
		await state.deleteTask(first.tasks[0].id);
		expect(listener).not.toHaveBeenCalled();
		expect(notifier.setNotice).not.toHaveBeenCalled();
	});
	it('propagates active loading failures for the existing retry UI', async () => {
		const { repo, state } = await setup();
		const error = new Error('Failed');
		vi.spyOn(repo, 'fetchBoard').mockRejectedValueOnce(error);
		await expect(state.reloadBoard()).rejects.toBe(error);
		expect(state.getBoardState().loading).toBe(false);
		await state.reloadBoard();
		expect(state.getColumns()).toHaveLength(4);
	});
	it('returns defensive copies and supports unsubscribe', async () => {
		const { state } = await setup();
		const meta = state.getBoardState();
		meta.boards.length = 0;
		state.getColumns()[0].title = 'Outside';
		state.getTasks()[0].title = 'Outside';
		expect(state.getBoardState().boards).toHaveLength(2);
		expect(state.getColumns()[0].title).not.toBe('Outside');
		expect(state.getTasks()[0].title).not.toBe('Outside');
		const listener = vi.fn();
		const off = state.subscribeBoards(listener);
		off();
		listener.mockClear();
		await state.reloadBoard();
		expect(listener).not.toHaveBeenCalled();
	});
});

describe('serialized board writes', () => {
	it('serializes optimistic changes, request parameters, full snapshots and revisions', async () => {
		const { repo, state, first } = await setup();
		const pending = deferred<KanbanSnapshot>();
		const write = vi.spyOn(repo, 'editTask').mockReturnValueOnce(pending.promise);
		const task = first.tasks[0];
		const one = edit(state, task, 'First');
		const two = edit(state, task, 'Second');
		await flush();
		expect(write).toHaveBeenCalledTimes(1);
		expect(state.getTasks().find((item) => item.id === task.id)?.title).toBe('First');
		const result = structuredClone(first);
		result.board.revision = 7;
		result.tasks[0].title = 'Server';
		result.columns[0].title = 'Server column';
		const secondResult = structuredClone(result);
		secondResult.board.revision = 8;
		secondResult.tasks[0].title = 'Second';
		write.mockResolvedValueOnce(secondResult);
		pending.resolve(result);
		await one;
		await two;
		expect(write.mock.calls.map((call) => call[1])).toEqual([0, 7]);
		expect(state.getTasks().find((item) => item.id === task.id)?.title).toBe('Second');
	});
	it('applies the complete server snapshot instead of merging only the changed item', async () => {
		const { repo, state, first } = await setup();
		const response = structuredClone(first);
		response.board.revision = 3;
		response.tasks = [];
		response.columns[0].title = 'Authoritative';
		vi.spyOn(repo, 'editColumn').mockResolvedValue(response);
		await state.editColumn(first.columns[0].id, 'Local', 'slate', null);
		expect(state.getColumns()).toEqual(response.columns);
		expect(state.getTasks()).toEqual([]);
		expect(state.getBoardState().revision).toBe(3);
	});
	it('rolls back before the next operation calculates its parameters', async () => {
		const { repo, state, first } = await setup();
		const fail = deferred<KanbanSnapshot>();
		vi.spyOn(repo, 'deleteTask').mockReturnValueOnce(fail.promise);
		const write = vi.spyOn(repo, 'addTask');
		const deleting = state.deleteTask(first.tasks[0].id);
		const adding = add(state, first.columns[0].id);
		await flush();
		expect(write).not.toHaveBeenCalled();
		fail.reject(new Error('Failed'));
		await deleting;
		await adding;
		expect(write.mock.calls[0][1]).toBe(0);
		expect(write.mock.calls[0][2].position).toBe(3000);
		expect(state.getTasks()).toHaveLength(7);
		expect(notifier.setNotice).toHaveBeenCalledWith(MESSAGES.tasks.deleteError, 'error');
	});
	it.each(['resolve', 'reject'] as const)(
		'ignores a late write and drops old queued operations after switching: %s',
		async (outcome) => {
			const { repo, state, first, second } = await setup();
			const pending = deferred<KanbanSnapshot>();
			const write = vi.spyOn(repo, 'editTask').mockReturnValueOnce(pending.promise);
			const old = edit(state, first.tasks[0], 'Old');
			const queued = state.deleteTask(first.tasks[1].id);
			const remove = vi.spyOn(repo, 'deleteTask');
			await flush();
			await state.selectBoard(second.board.id);
			await edit(state, second.tasks[0], 'New');
			const tasks = state.getTasks();
			const meta = state.getBoardState();
			if (outcome === 'resolve') pending.resolve(first);
			else pending.reject(new Error('Old'));
			await old;
			await queued;
			expect(state.getTasks()).toEqual(tasks);
			expect(state.getBoardState()).toEqual(meta);
			expect(remove).not.toHaveBeenCalled();
			expect(write).toHaveBeenCalledTimes(2);
			expect(notifier.setNotice).not.toHaveBeenCalled();
		}
	);
	it('does not overlap writes to the same board after leaving and returning', async () => {
		const { repo, state, first, second } = await setup();
		const pending = deferred<KanbanSnapshot>();
		const write = vi.spyOn(repo, 'editTask').mockReturnValueOnce(pending.promise);
		const old = edit(state, first.tasks[0], 'Old');
		await flush();
		await state.selectBoard(second.board.id);
		await state.selectBoard(first.board.id);
		const next = edit(state, first.tasks[0], 'New');
		await flush();
		expect(write).toHaveBeenCalledTimes(1);
		pending.resolve(first);
		await old;
		await next;
		expect(write).toHaveBeenCalledTimes(2);
	});
	it('calculates positions inside the queue after the previous authoritative response', async () => {
		const { repo, state, first } = await setup();
		const write = vi.spyOn(repo, 'addTask');
		await Promise.all([add(state, first.columns[0].id, 'One'), add(state, first.columns[0].id, 'Two')]);
		expect(write.mock.calls.map((call) => [call[1], call[2].position])).toEqual([
			[0, 3000],
			[1, 4000],
		]);
		expect(state.getBoardState().revision).toBe(2);
	});
	it('does not let an old column move clear the current board movement flag', async () => {
		const { repo, state, first, second } = await setup();
		const oldPending = deferred<KanbanSnapshot>();
		const newPending = deferred<KanbanSnapshot>();
		vi.spyOn(repo, 'reorderColumns')
			.mockReturnValueOnce(oldPending.promise)
			.mockReturnValueOnce(newPending.promise);
		const old = state.moveColumn(first.columns[0].id, 2);
		await flush();
		await state.selectBoard(second.board.id);
		const current = state.moveColumn(second.columns[0].id, 2);
		await flush();
		expect(state.isMovingColumn).toBe(true);
		oldPending.resolve(first);
		await old;
		expect(state.isMovingColumn).toBe(true);
		newPending.resolve(second);
		await current;
		expect(state.isMovingColumn).toBe(false);
	});
	it('does not write while loading or before initialization', async () => {
		const repo = createRepo();
		const state = createState(repo);
		const write = vi.spyOn(repo, 'addColumn');
		await state.addColumn('No board', 'slate', 10);
		expect(write).not.toHaveBeenCalled();
	});
	it.each(['resolve', 'reject'] as const)(
		'ignores late write callbacks and queued work after destruction: %s',
		async (outcome) => {
			const { repo, state, first } = await setup();
			const pending = deferred<KanbanSnapshot>();
			vi.spyOn(repo, 'deleteTask').mockReturnValueOnce(pending.promise);
			const write = vi.spyOn(repo, 'addColumn');
			const deleting = state.deleteTask(first.tasks[0].id);
			const adding = state.addColumn('Queued', 'slate', 10);
			await flush();
			state.destroy();
			const tasks = state.getTasks();
			if (outcome === 'resolve') pending.resolve(first);
			else pending.reject(new Error('Late'));
			await deleting;
			await adding;
			expect(state.getTasks()).toEqual(tasks);
			expect(write).not.toHaveBeenCalled();
			expect(notifier.setNotice).not.toHaveBeenCalled();
		}
	);
	it('records 409, cancels queued writes and resumes only through an explicit reload', async () => {
		const { repo, state, first } = await setup();
		const write = vi.spyOn(repo, 'editTask').mockRejectedValueOnce(new BoardRevisionConflictError(8));
		const one = edit(state, first.tasks[0], 'Conflict');
		const two = edit(state, first.tasks[1], 'Queued');
		await one;
		await two;
		expect(write).toHaveBeenCalledTimes(1);
		expect(state.getTasks()).toEqual(first.tasks);
		expect(state.getBoardState()).toMatchObject({
			revision: 0,
			conflict: { boardId: first.board.id, currentRevision: 8 },
		});
		await edit(state, first.tasks[0], 'Blocked');
		expect(write).toHaveBeenCalledTimes(1);
		const fresh = structuredClone(first);
		fresh.board.revision = 8;
		vi.spyOn(repo, 'fetchBoard').mockRejectedValueOnce(new Error('Refresh failed')).mockResolvedValueOnce(fresh);
		await expect(state.reloadBoard()).rejects.toThrow('Refresh failed');
		expect(state.getBoardState().conflict?.currentRevision).toBe(8);
		await state.reloadBoard();
		expect(state.getBoardState()).toMatchObject({ revision: 8, conflict: null });
		write.mockResolvedValueOnce({ ...fresh, board: { ...fresh.board, revision: 9 } });
		await edit(state, first.tasks[0], 'Resumed');
		expect(write.mock.calls[1][1]).toBe(8);
	});
});

describe('existing column and task behavior', () => {
	it('creates, edits and deletes columns using snapshots and nullable limits', async () => {
		const { state } = await setup();
		await state.addColumn('Added', 'slate', null);
		const column = state.getColumns().find((item) => item.title === 'Added')!;
		await state.editColumn(column.id, 'Edited', 'rose', null);
		expect(state.getColumns().find((item) => item.id === column.id)).toMatchObject({
			title: 'Edited',
			taskLimit: null,
		});
		await state.deleteColumn(column.id);
		expect(state.getColumns()).toHaveLength(4);
		expect(state.getBoardState().revision).toBe(3);
	});
	it('moves columns with one full-order request and normalized positions, preserving no-op behavior', async () => {
		const { repo, state, first } = await setup();
		const reorder = vi.spyOn(repo, 'reorderColumns');
		await state.moveColumn(first.columns[0].id, 2);
		expect(reorder).toHaveBeenCalledExactlyOnceWith(first.board.id, 0, [
			first.columns[1].id,
			first.columns[2].id,
			first.columns[0].id,
			first.columns[3].id,
		]);
		expect(state.getColumns().map((item) => item.position)).toEqual([1000, 2000, 3000, 4000]);
		expect(state.isMovingColumn).toBe(false);
		await state.moveColumn(first.columns[0].id, 2);
		expect(reorder).toHaveBeenCalledTimes(1);
	});
	it('rolls back failed column moves and clears the DnD flag', async () => {
		const { repo, state, first } = await setup();
		vi.spyOn(repo, 'reorderColumns').mockRejectedValue(new Error('Move failed'));
		await state.moveColumn(first.columns[0].id, 3);
		expect(state.getColumns()).toEqual(first.columns);
		expect(state.isMovingColumn).toBe(false);
	});
	it('creates nullable tasks, completes, restores, moves and deletes them', async () => {
		const { state, first } = await setup();
		await add(state, first.columns[0].id);
		let task = state.getTasks().find((item) => item.title === 'Added')!;
		expect(task).toMatchObject({ status: null, priority: null, startDate: null, endDate: null });
		await edit(state, task, 'Added', true);
		task = state.getTasks().find((item) => item.id === task.id)!;
		expect(task.completed).toBe(true);
		await edit(state, task, 'Added', false);
		await state.moveTask(task.id, first.columns[1].id);
		expect(state.getTasks().find((item) => item.id === task.id)?.columnId).toBe(first.columns[1].id);
		await state.moveTask(task.id, first.columns[1].id, 500);
		expect(state.getTasks().find((item) => item.id === task.id)?.position).toBe(500);
		expect(state.isMovingTask).toBe(false);
		await state.deleteTask(task.id);
		expect(state.getTasks()).toHaveLength(6);
	});
	it('uses the latest column limit when queued task creation starts, with null unlimited', async () => {
		const { repo, state, first } = await setup();
		const column = first.columns[0];
		const update = state.editColumn(column.id, column.title, column.color, null);
		const adding = add(state, column.id, 'Unlimited');
		await update;
		await adding;
		expect(state.getTasks().some((task) => task.title === 'Unlimited')).toBe(true);
		const write = vi.spyOn(repo, 'addTask');
		await state.editColumn(column.id, column.title, column.color, 1);
		await add(state, column.id, 'Blocked');
		expect(write).not.toHaveBeenCalled();
	});
	it('enforces column counts, task movement capacity and title lengths without API writes', async () => {
		const { repo, state, first } = await setup();
		const write = vi.spyOn(repo, 'addColumn');
		await state.addColumn('X'.repeat(21), 'slate', 10);
		expect(write).not.toHaveBeenCalled();
		await state.addColumn('Fifth', 'slate', 10);
		await state.addColumn('Sixth', 'slate', 10);
		await state.addColumn('Seventh', 'slate', 10);
		expect(write).toHaveBeenCalledTimes(2);
		const destination = first.columns[0];
		await state.editColumn(destination.id, destination.title, destination.color, 1);
		const move = vi.spyOn(repo, 'moveTask');
		await state.moveTask(first.tasks.find((task) => task.columnId !== destination.id)!.id, destination.id);
		expect(move).not.toHaveBeenCalled();
		const addTask = vi.spyOn(repo, 'addTask');
		await add(state, destination.id, 'X'.repeat(61));
		expect(addTask).not.toHaveBeenCalled();
	});
	it('leaves visual task sorting and completed placement unchanged', async () => {
		const { state, first } = await setup();
		const task = first.tasks[0];
		await edit(state, task, task.title, true);
		const sorted = state.getTasks().sort(sortTasks);
		expect(sorted.at(-1)?.id).toBe(task.id);
	});
});

describe('board management for workspace tabs', () => {
	it('creates a board, selects its returned snapshot and keeps the server list order', async () => {
		const { repo, state, first, second } = await setup();
		const write = vi.spyOn(repo, 'createBoard');
		expect(await state.createBoard(' New ')).toBe(true);
		const view = state.getBoardState();
		expect(write).toHaveBeenCalledExactlyOnceWith('New');
		expect(view.boards.map((board) => board.title)).toEqual([first.board.title, second.board.title, 'New']);
		expect(view.activeBoardId).toBe(view.boards[2].id);
		expect(view.revision).toBe(0);
		expect(view.savingBoard).toBe(false);
		expect(state.getColumns()).toHaveLength(0);
		expect(state.getTasks()).toHaveLength(0);
	});
	it('renames with the revision from the previous queued task operation', async () => {
		const { repo, state, first } = await setup();
		const rename = vi.spyOn(repo, 'renameBoard');
		const task = edit(state, first.tasks[0], 'Task edit');
		const naming = state.renameBoard(first.board.id, ' Renamed ');
		await task;
		expect(await naming).toBe(true);
		expect(rename).toHaveBeenCalledExactlyOnceWith(first.board.id, 1, 'Renamed');
		expect(state.getBoardState().revision).toBe(2);
		expect(state.getBoardState().boards[0].title).toBe('Renamed');
	});
	it('deletes the selected board with its latest revision and selects the first remaining board', async () => {
		const { repo, state, first, second } = await setup();
		await state.selectBoard(second.board.id);
		await state.renameBoard(second.board.id, 'Changed');
		const remove = vi.spyOn(repo, 'deleteBoard');
		expect(await state.deleteBoard(second.board.id)).toBe(true);
		expect(remove).toHaveBeenCalledExactlyOnceWith(second.board.id, 1);
		expect(state.getBoardState()).toMatchObject({
			activeBoardId: first.board.id,
			revision: 0,
			canDeleteBoard: false,
		});
		expect(state.getTasks()).toEqual(first.tasks);
		expect(await state.deleteBoard(first.board.id)).toBe(false);
		expect(remove).toHaveBeenCalledTimes(1);
	});
	it('rejects invalid titles and the eleventh board without sending requests', async () => {
		const { repo, state } = await setup();
		const write = vi.spyOn(repo, 'createBoard');
		for (const title of ['', '  ', 'x'.repeat(31)]) expect(await state.createBoard(title)).toBe(false);
		expect(write).not.toHaveBeenCalled();
		for (let i = 0; i < 8; i++) expect(await state.createBoard('Duplicate')).toBe(true);
		expect(state.getBoardState().canCreateBoard).toBe(false);
		expect(await state.createBoard('Extra')).toBe(false);
		expect(write).toHaveBeenCalledTimes(8);
	});
	it('returns false on create and rename errors so the UI can preserve drafts and retry', async () => {
		const { repo, state, first } = await setup();
		vi.spyOn(repo, 'createBoard').mockRejectedValueOnce(new Error('Creation failed'));
		expect(await state.createBoard('Draft')).toBe(false);
		expect(state.getBoardState().boards).toHaveLength(2);
		expect(await state.createBoard('Draft')).toBe(true);
		const id = state.getBoardState().activeBoardId!;
		vi.spyOn(repo, 'renameBoard').mockRejectedValueOnce(new Error('Rename failed'));
		expect(await state.renameBoard(id, 'Name draft')).toBe(false);
		expect(state.getBoardState().boards.find((board) => board.id === id)?.title).toBe('Draft');
		expect(await state.renameBoard(id, 'Name draft')).toBe(true);
		expect(state.getBoardState().boards[0].id).toBe(first.board.id);
	});
	it.each(['rename', 'delete'] as const)(
		'handles %s revision conflicts without retry and permits an explicit refresh',
		async (operation) => {
			const { repo, state, first } = await setup();
			const read = vi.spyOn(repo, 'fetchBoard');
			const method = operation === 'rename' ? vi.spyOn(repo, 'renameBoard') : vi.spyOn(repo, 'deleteBoard');
			method.mockRejectedValueOnce(new BoardRevisionConflictError(4));
			const success =
				operation === 'rename'
					? await state.renameBoard(first.board.id, 'Draft')
					: await state.deleteBoard(first.board.id);
			expect(success).toBe(false);
			expect(method).toHaveBeenCalledOnce();
			expect(read).not.toHaveBeenCalled();
			expect(state.getBoardState().conflict?.currentRevision).toBe(4);
			await state.reloadBoard();
			expect(read).toHaveBeenCalledOnce();
			expect(state.getBoardState().conflict).toBeNull();
		}
	);
	it('prevents duplicate board requests and ignores late creation after switching', async () => {
		const { repo, state, first, second } = await setup();
		const pending = deferred<KanbanSnapshot>();
		const write = vi.spyOn(repo, 'createBoard').mockReturnValueOnce(pending.promise);
		const creating = state.createBoard('Pending');
		await flush();
		expect(state.getBoardState().savingBoard).toBe(true);
		expect(await state.createBoard('Duplicate')).toBe(false);
		await state.selectBoard(second.board.id);
		pending.resolve({ ...first, board: { ...first.board, id: 'late' } });
		expect(await creating).toBe(false);
		expect(state.getBoardState().activeBoardId).toBe(second.board.id);
		expect(state.getBoardState().boards).toHaveLength(2);
		expect(write).toHaveBeenCalledOnce();
	});
	it('keeps deletion committed and exposes retry when the next snapshot fails to load', async () => {
		const { repo, state, first, second } = await setup();
		vi.spyOn(repo, 'fetchBoard').mockRejectedValueOnce(new Error('Read failed'));
		expect(await state.deleteBoard(first.board.id)).toBe(true);
		expect(state.getBoardState()).toMatchObject({
			activeBoardId: second.board.id,
			loadError: true,
			savingBoard: false,
		});
		expect(state.getBoardState().boards).toHaveLength(1);
		await state.reloadBoard();
		expect(state.getBoardState().loadError).toBe(false);
	});
});

describe('personal state stabilization regressions', () => {
	it('never hydrates another account or demo instance from a previous state', async () => {
		const { state: a, first } = await setup();
		const bRepo = createRepo('account-b');
		const pending = deferred<{ boards: [] }>();
		vi.spyOn(bRepo, 'fetchBoards').mockReturnValue(pending.promise);
		const b = createState(bRepo);
		const loading = b.loadData();
		expect(b.getColumns()).toEqual([]);
		expect(b.getTasks()).toEqual([]);
		expect(b.getBoardState().boards).toEqual([]);
		a.destroy();
		expect(a.getColumns()).toEqual([]);
		expect(a.getBoardState().boards).toEqual([]);
		pending.resolve({ boards: [] });
		await loading;
		expect(b.getBoardState().activeBoardId).toBe(first.board.id);
		expect(b.getBoardState().boards[0].ownerId).toBe('account-b');
		const nextDemo = createState(createRepo('demo'));
		expect(nextDemo.getTasks()).toEqual([]);
		expect(nextDemo.getBoardState().boards).toEqual([]);
	});
	it('switches already loaded boards immediately without extra requests or background updates', async () => {
		const { repo, state, first, second } = await setup();
		const read = vi.spyOn(repo, 'fetchBoard');
		await state.selectBoard(second.board.id);
		expect(read).toHaveBeenCalledTimes(1);
		await state.selectBoard(first.board.id);
		await state.selectBoard(second.board.id);
		expect(read).toHaveBeenCalledTimes(1);
		expect(state.getTasks()).toEqual(second.tasks);
	});
	it('serializes task writes behind a rename and uses its new revision', async () => {
		const { repo, state, first } = await setup();
		const pending = deferred<KanbanSnapshot>();
		vi.spyOn(repo, 'renameBoard').mockReturnValueOnce(pending.promise);
		const taskWrite = vi
			.spyOn(repo, 'editTask')
			.mockResolvedValue({ ...first, board: { ...first.board, revision: 2 } });
		const renaming = state.renameBoard(first.board.id, 'Renamed');
		await flush();
		const editing = edit(state, first.tasks[0], 'Task');
		await flush();
		expect(taskWrite).not.toHaveBeenCalled();
		pending.resolve({ ...first, board: { ...first.board, title: 'Renamed', revision: 1 } });
		await renaming;
		await editing;
		expect(taskWrite.mock.calls[0][1]).toBe(1);
	});
	it('does not execute queued tasks after the board has been deleted', async () => {
		const { repo, state, first } = await setup();
		const pending = deferred<{ deleted_board_id: string }>();
		vi.spyOn(repo, 'deleteBoard').mockReturnValueOnce(pending.promise);
		const write = vi.spyOn(repo, 'editTask');
		const deleting = state.deleteBoard(first.board.id);
		await flush();
		const editing = edit(state, first.tasks[0], 'Must not write');
		pending.resolve({ deleted_board_id: first.board.id });
		await deleting;
		await editing;
		expect(write).not.toHaveBeenCalled();
		expect(state.getBoardState().activeBoardId).not.toBe(first.board.id);
	});
	it('applies the entire rename snapshot, including an inactive board', async () => {
		const { repo, state, first, second } = await setup();
		await state.selectBoard(second.board.id);
		const result = structuredClone(first);
		result.board.revision = 3;
		result.tasks[0].title = 'Server title';
		result.columns[0].taskLimit = null;
		vi.spyOn(repo, 'renameBoard').mockResolvedValueOnce(result);
		expect(await state.renameBoard(first.board.id, 'Name')).toBe(true);
		expect(state.getTasks()).toEqual(second.tasks);
		await state.selectBoard(first.board.id);
		expect(state.getTasks()).toEqual(result.tasks);
		expect(state.getColumns()).toEqual(result.columns);
	});
	it('preserves the conflict across cached switches until a successful explicit refresh', async () => {
		const { repo, state, first, second } = await setup();
		vi.spyOn(repo, 'editTask').mockRejectedValueOnce(new BoardRevisionConflictError(4));
		await edit(state, first.tasks[0]);
		await state.selectBoard(second.board.id);
		await state.selectBoard(first.board.id);
		expect(state.getBoardState().conflict?.currentRevision).toBe(4);
		const write = vi.spyOn(repo, 'deleteTask');
		await state.deleteTask(first.tasks[0].id);
		expect(write).not.toHaveBeenCalled();
		vi.spyOn(repo, 'fetchBoard').mockResolvedValueOnce({ ...first, board: { ...first.board, revision: 4 } });
		await state.reloadBoard();
		expect(state.getBoardState().conflict).toBeNull();
	});
	it.each([403, 404])('discards inaccessible board snapshots and closes private forms after %s', async (status) => {
		const { repo, state, first } = await setup();
		const close = vi.fn();
		state.registerEditor(close);
		vi.spyOn(repo, 'fetchBoard').mockRejectedValueOnce(
			Object.assign(new Error('Unavailable'), { isAxiosError: true, response: { status } })
		);
		await expect(state.reloadBoard()).rejects.toThrow('Unavailable');
		expect(state.getTasks()).toEqual([]);
		expect(state.getColumns()).toEqual([]);
		expect(state.getBoardState().boards.some((board) => board.id === first.board.id)).toBe(false);
		expect(close).toHaveBeenCalledOnce();
	});
	it('drops an unavailable late target without disturbing the current board', async () => {
		const { repo, state, first, second } = await setup();
		const pending = deferred<KanbanSnapshot>();
		vi.spyOn(repo, 'fetchBoard').mockReturnValueOnce(pending.promise);
		const old = state.selectBoard(second.board.id);
		await state.selectBoard(first.board.id);
		pending.reject(Object.assign(new Error('Missing'), { isAxiosError: true, response: { status: 404 } }));
		await old;
		expect(state.getBoardState()).toMatchObject({ activeBoardId: first.board.id, loadError: false });
		expect(state.getTasks()).toEqual(first.tasks);
		expect(state.getBoardState().boards.some((board) => board.id === second.board.id)).toBe(false);
	});
	it('blocks switching rather than destroying an open draft, and permits manual reload without closing it', async () => {
		const { state, first, second } = await setup();
		const close = vi.fn();
		const release = state.registerEditor(close);
		await state.selectBoard(second.board.id);
		expect(state.getBoardState().activeBoardId).toBe(first.board.id);
		expect(close).not.toHaveBeenCalled();
		await state.reloadBoard();
		expect(close).not.toHaveBeenCalled();
		expect(state.getBoardState().hasOpenEditor).toBe(true);
		release();
		await state.selectBoard(second.board.id);
		expect(state.getBoardState().activeBoardId).toBe(second.board.id);
	});
	it('remembers a late successful own write so returning and writing again does not manufacture a conflict', async () => {
		const { repo, state, first, second } = await setup();
		const pending = deferred<KanbanSnapshot>();
		const write = vi.spyOn(repo, 'editTask').mockReturnValueOnce(pending.promise);
		const old = edit(state, first.tasks[0], 'One');
		await flush();
		await state.selectBoard(second.board.id);
		await state.selectBoard(first.board.id);
		const response = structuredClone(first);
		response.board.revision = 1;
		response.tasks[0].title = 'One';
		const next = edit(state, first.tasks[1], 'Two');
		await flush();
		expect(write).toHaveBeenCalledTimes(1);
		write.mockResolvedValueOnce({ ...response, board: { ...response.board, revision: 2 } });
		pending.resolve(response);
		await old;
		await next;
		expect(write.mock.calls[1][1]).toBe(1);
		expect(state.getBoardState().conflict).toBeNull();
	});
});
