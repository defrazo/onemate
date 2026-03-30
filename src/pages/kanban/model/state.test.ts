import { beforeEach, describe, expect, it, type Mock, vi } from 'vitest';

import type { IKanbanRepo } from '../api';
import { getDefaultColumns, getDefaultTasks, notifier } from '../lib';
import { MESSAGES } from '../lib/constants';
import { type Column, createState, type Task } from '.';

const createRepoMock = (): IKanbanRepo => ({
	fetchColumns: vi.fn(),
	addColumn: vi.fn(),
	editColumn: vi.fn(),
	deleteColumn: vi.fn(),
	moveColumn: vi.fn(),
	fetchTasks: vi.fn(),
	addTask: vi.fn(),
	editTask: vi.fn(),
	deleteTask: vi.fn(),
	moveTask: vi.fn(),
});

vi.mock('../lib', async () => {
	const { MESSAGES, LIMITS } = await vi.importActual<typeof import('../lib/constants')>('../lib/constants');

	return {
		getDefaultColumns: vi.fn(),
		getDefaultTasks: vi.fn(),
		notifier: { setNotice: vi.fn() },
		MESSAGES,
		LIMITS,
	};
});

const mockColumns: Column[] = [
	{ id: 'c1', title: 'Запланировано', color: 'slate', taskLimit: 10, position: 0 },
	{ id: 'c2', title: 'Подготовка', color: 'amber', taskLimit: 10, position: 1 },
	{ id: 'c3', title: 'В работе', color: 'rose', taskLimit: 10, position: 2 },
	{ id: 'c4', title: 'Завершено', color: 'lime', taskLimit: 10, position: 3 },
];

const mockTasks: Task[] = [
	{
		id: 't1',
		columnId: 'c1',
		title: 'Задача 1',
		description: 'Описание задачи',
		status: 'waiting',
		priority: 'high',
		startDate: '2026-03-18',
		endDate: '2026-03-20',
		completed: false,
		position: 0,
		createdAt: '18.03.2026, 10:00',
	},
	{
		id: 't2',
		columnId: 'c1',
		title: 'Задача 2',
		description: 'Описание задачи',
		status: 'active',
		priority: 'medium',
		startDate: '2026-03-18',
		endDate: '2026-03-20',
		completed: false,
		position: 0,
		createdAt: '18.03.2026, 10:00',
	},
];

const createInitializedState = async () => {
	const repo = createRepoMock();

	(repo.fetchColumns as Mock).mockResolvedValue(mockColumns);
	(repo.fetchTasks as Mock).mockResolvedValue(mockTasks);

	const state = createState(repo);
	await state.loadData();

	return { state, repo };
};

describe('state', () => {
	beforeEach(() => vi.clearAllMocks());

	describe('columns', () => {
		let state: ReturnType<typeof createState>;
		let repo: IKanbanRepo;

		describe('fetchColumns', () => {
			beforeEach(() => {
				repo = createRepoMock();
				state = createState(repo);
			});

			it('should notify subscribers with columns when request succeeds', async () => {
				// ARRANGE
				(repo.fetchColumns as Mock).mockResolvedValue(mockColumns);
				(repo.fetchTasks as Mock).mockResolvedValue([]);

				const listener = vi.fn();
				state.subscribeColumns(listener);

				// ACT
				await state.loadData();

				// ASSERT
				expect(listener).toHaveBeenCalledTimes(2);
				expect(listener).toHaveBeenLastCalledWith(mockColumns);
			});

			it('should create default columns when API returns empty array', async () => {
				// ARRANGE
				const defaultColumns: Omit<Column, 'id'>[] = [
					{ title: 'Новая', color: 'slate', taskLimit: 10, position: 0 },
				];
				(repo.fetchColumns as Mock).mockResolvedValue([]);
				(repo.fetchTasks as Mock).mockResolvedValue([]);
				(getDefaultColumns as Mock).mockReturnValue(defaultColumns);
				(repo.addColumn as Mock).mockResolvedValue({ id: 'c1', ...defaultColumns[0] });

				// ACT
				await state.loadData();

				// ASSERT
				expect(repo.addColumn).toHaveBeenCalledWith(defaultColumns[0]);
			});

			it('should show error when request fails', async () => {
				// ARRANGE
				(repo.fetchColumns as Mock).mockRejectedValue(new Error('network'));
				(repo.fetchTasks as Mock).mockResolvedValue([]);

				// ACT
				await state.loadData();

				// ASSERT
				expect(notifier.setNotice).toHaveBeenCalledWith(MESSAGES.columns.fetchError, 'error');
			});
		});

		describe('actions', () => {
			beforeEach(async () => {
				const initialized = await createInitializedState();
				state = initialized.state;
				repo = initialized.repo;
			});

			describe('addColumn', () => {
				it('should add column and notify subscribers when request succeeds', async () => {
					// ARRANGE
					const newColumn: Column = { id: 'c3', title: 'Готово', color: 'slate', taskLimit: 0, position: 4 };
					(repo.addColumn as Mock).mockResolvedValue(newColumn);

					const listener = vi.fn();
					state.subscribeColumns(listener);
					listener.mockClear();

					// ACT
					await state.addColumn('Готово', 'slate', 0);

					// ASSERT
					expect(repo.addColumn).toHaveBeenCalledWith({
						title: 'Готово',
						color: 'slate',
						taskLimit: 0,
						position: 4,
					});
					expect(listener).toHaveBeenCalledTimes(1);
					expect(state.getColumns()).toContainEqual(newColumn);
					expect(notifier.setNotice).toHaveBeenCalledWith(MESSAGES.columns.added, 'success');
				});

				it('should rollback state when request fails', async () => {
					// ARRANGE
					(repo.addColumn as Mock).mockRejectedValue(new Error('fail'));

					const columnsBefore = state.getColumns();

					// ACT
					await state.addColumn('Сломанная', 'sky', 0);

					// ASSERT
					expect(state.getColumns()).toEqual(columnsBefore);
					expect(notifier.setNotice).toHaveBeenCalledWith(MESSAGES.columns.addError, 'error');
				});
			});

			describe('editColumn', () => {
				it('should update column optimistically when request succeeds', async () => {
					// ARRANGE
					(repo.editColumn as Mock).mockResolvedValue(undefined);

					// ACT
					await state.editColumn('c1', 'Переделать', 7, 'sky');

					// ASSERT
					const updated = state.getColumns().find((column) => column.id === 'c1');
					expect(updated).toMatchObject({ title: 'Переделать', color: 'sky', taskLimit: 7 });
					expect(repo.editColumn).toHaveBeenCalledWith('c1', {
						title: 'Переделать',
						color: 'sky',
						taskLimit: 7,
					});
					expect(notifier.setNotice).toHaveBeenCalledWith(MESSAGES.columns.updated, 'success');
				});

				it('should rollback changes when request fails', async () => {
					// ARRANGE
					(repo.editColumn as Mock).mockRejectedValue(new Error('fail'));
					const before = state.getColumns().find((column) => column.id === 'c1');

					// ACT
					await state.editColumn('c1', 'Переделать', 99, 'sky');

					// ASSERT
					const after = state.getColumns().find((column) => column.id === 'c1');
					expect(after).toEqual(before);
					expect(notifier.setNotice).toHaveBeenCalledWith(MESSAGES.columns.updateError, 'error');
				});
			});

			describe('deleteColumn', () => {
				it('should delete column when request succeeds', async () => {
					// ARRANGE
					(repo.deleteColumn as Mock).mockResolvedValue(undefined);

					// ACT
					await state.deleteColumn('c1');

					// ASSERT
					expect(state.getColumns().find((column) => column.id === 'c1')).toBeUndefined();
					expect(repo.deleteColumn).toHaveBeenCalledWith('c1');
					expect(notifier.setNotice).toHaveBeenCalledWith(MESSAGES.columns.deleted, 'success');
				});

				it('should rollback deletion when request fails', async () => {
					// ARRANGE
					(repo.deleteColumn as Mock).mockRejectedValue(new Error('fail'));
					const countBefore = state.getColumns().length;

					// ACT
					await state.deleteColumn('c1');

					// ASSERT
					expect(state.getColumns()).toHaveLength(countBefore);
					expect(notifier.setNotice).toHaveBeenCalledWith(MESSAGES.columns.deleteError, 'error');
				});
			});

			describe('moveColumn', () => {
				it('should reorder columns when request succeeds', async () => {
					// ARRANGE
					(repo.moveColumn as Mock).mockResolvedValue(undefined);

					// ACT
					await state.moveColumn('c2', 0);

					// ASSERT
					const cols = state.getColumns();
					expect(cols.map((column) => column.id)).toEqual(['c2', 'c1', 'c3', 'c4']);
					expect(cols.map((column) => column.position)).toEqual([0, 1, 2, 3]);
					expect(notifier.setNotice).toHaveBeenCalledWith(MESSAGES.columns.moved, 'success');
				});

				it('should do nothing when oldIndex equals newIndex', async () => {
					// ACT
					await state.moveColumn('c1', 0);

					// ASSERT
					expect(repo.moveColumn).not.toHaveBeenCalled();
				});

				it('should rollback reorder when request fails', async () => {
					// ARRANGE
					(repo.moveColumn as Mock).mockRejectedValue(new Error('fail'));
					const before = state.getColumns().map((column) => column.id);

					// ACT
					await state.moveColumn('c2', 0);

					// ASSERT
					expect(state.getColumns().map((column) => column.id)).toEqual(before);
					expect(notifier.setNotice).toHaveBeenCalledWith(MESSAGES.columns.moveError, 'error');
				});
			});
		});
	});

	describe('tasks', () => {
		let state: ReturnType<typeof createState>;
		let repo: IKanbanRepo;

		describe('fetchTasks', () => {
			beforeEach(() => {
				repo = createRepoMock();
				state = createState(repo);
			});

			it('should notify subscribers with tasks when request succeeds', async () => {
				// ARRANGE
				(repo.fetchColumns as Mock).mockResolvedValue(mockColumns);
				(repo.fetchTasks as Mock).mockResolvedValue(mockTasks);

				const listener = vi.fn();
				state.subscribeTasks(listener);

				// ACT
				await state.loadData();

				// ASSERT
				expect(listener).toHaveBeenCalledTimes(2);
				expect(listener).toHaveBeenLastCalledWith(mockTasks);
			});

			it('should create default tasks when API returns empty array', async () => {
				// ARRANGE
				const defaultTask: Omit<Task, 'id'> = {
					columnId: 'c1',
					title: 'Задача 0',
					description: 'Описание задачи',
					status: 'waiting',
					priority: 'high',
					startDate: '2026-03-18',
					endDate: '2026-03-20',
					completed: false,
					position: 0,
					createdAt: '18.03.2026, 10:00',
				};

				(repo.fetchColumns as Mock).mockResolvedValue(mockColumns);
				(repo.fetchTasks as Mock).mockResolvedValue([]);
				(getDefaultTasks as Mock).mockReturnValue([defaultTask]);
				(repo.addTask as Mock).mockResolvedValue({ id: 't3', ...defaultTask });

				// ACT
				await state.loadData();

				// ASSERT
				expect(repo.addTask).toHaveBeenCalledWith(defaultTask);
			});

			it('should show error when request fails', async () => {
				// ARRANGE
				(repo.fetchColumns as Mock).mockResolvedValue(mockColumns);
				(repo.fetchTasks as Mock).mockRejectedValue(new Error('network'));

				// ACT
				await state.loadData();

				// ASSERT
				expect(notifier.setNotice).toHaveBeenCalledWith(MESSAGES.tasks.fetchError, 'error');
			});
		});

		describe('actions', () => {
			beforeEach(async () => {
				const initialized = await createInitializedState();
				state = initialized.state;
				repo = initialized.repo;
			});

			describe('addTask', () => {
				it('should add task and notify subscribers when request succeeds', async () => {
					// ARRANGE
					const newTask: Task = {
						id: 't3',
						columnId: 'c1',
						title: 'Задача 3',
						description: 'Описание',
						status: 'waiting',
						priority: 'high',
						startDate: '2026-03-18',
						endDate: null,
						completed: false,
						position: 2,
						createdAt: '18.03.2026, 10:00',
					};
					(repo.addTask as Mock).mockResolvedValue(newTask);

					const listener = vi.fn();
					state.subscribeTasks(listener);
					listener.mockClear();

					// ACT
					await state.addTask(
						'c1',
						'Задача 3',
						'Описание',
						'waiting',
						'high',
						'2026-03-18',
						null,
						false,
						'18.03.2026, 10:00',
						10
					);

					// ASSERT
					expect(repo.addTask).toHaveBeenCalledWith(
						expect.objectContaining({ title: 'Задача 3', columnId: 'c1', position: 1 })
					);
					expect(listener).toHaveBeenCalledTimes(1);
					expect(notifier.setNotice).toHaveBeenCalledWith(MESSAGES.tasks.added, 'success');
				});

				it('should rollback state when request fails', async () => {
					// ARRANGE
					(repo.addTask as Mock).mockRejectedValue(new Error('fail'));

					const listener = vi.fn();
					state.subscribeTasks(listener);
					const tasksBefore = listener.mock.calls.at(-1)?.[0];
					listener.mockClear();

					// ACT
					await state.addTask('c1', 'Задача 3', '', 'active', 'low', '', '', false, '18.03.2026, 10:00', 10);

					// ASSERT
					expect(listener).toHaveBeenLastCalledWith(tasksBefore);
					expect(notifier.setNotice).toHaveBeenCalledWith(MESSAGES.tasks.addError, 'error');
				});
			});

			describe('editTask', () => {
				it('should update task optimistically when request succeeds', async () => {
					// ARRANGE
					(repo.editTask as Mock).mockResolvedValue(undefined);

					// ACT
					await state.editTask(
						't1',
						'Задача 3',
						'Новое описание задачи',
						'active',
						'high',
						'2024-02-01',
						'2024-02-01',
						false,
						'18.03.2026, 10:00'
					);

					// ASSERT
					expect(repo.editTask).toHaveBeenCalledWith('t1', {
						title: 'Задача 3',
						description: 'Новое описание задачи',
						status: 'active',
						priority: 'high',
						startDate: '2024-02-01',
						endDate: '2024-02-01',
						completed: false,
						createdAt: '18.03.2026, 10:00',
					});
					expect(notifier.setNotice).toHaveBeenCalledWith(MESSAGES.tasks.updated, 'success');
				});

				it('should rollback changes when request fails', async () => {
					// ARRANGE
					(repo.editTask as Mock).mockRejectedValue(new Error('fail'));

					const listener = vi.fn();
					state.subscribeTasks(listener);
					const before = listener.mock.calls.at(-1)?.[0];
					listener.mockClear();

					// ACT
					await state.editTask('t1', 'Задача 3', '', 'active', 'low', '', '', false, '18.03.2026, 10:00');

					// ASSERT
					expect(listener).toHaveBeenLastCalledWith(before);
					expect(notifier.setNotice).toHaveBeenCalledWith(MESSAGES.tasks.updateError, 'error');
				});
			});

			describe('moveTask', () => {
				it('should move task to another column when request succeeds', async () => {
					// ARRANGE
					(repo.moveTask as Mock).mockResolvedValue(undefined);

					const listener = vi.fn();
					state.subscribeTasks(listener);
					listener.mockClear();

					// ACT
					await state.moveTask('t1', 'c2', 0);

					// ASSERT
					expect(repo.moveTask).toHaveBeenCalledWith('t1', 'c2', expect.any(Number));
					expect(notifier.setNotice).toHaveBeenCalledWith(MESSAGES.tasks.moved, 'success');

					const tasks: any[] = listener.mock.calls.at(-1)?.[0];
					const moved = tasks.find((task: Task) => task.id === 't1');
					expect(moved?.columnId).toBe('c2');
				});

				it('should move task to end when index exceeds length', async () => {
					// ARRANGE
					(repo.moveTask as Mock).mockResolvedValue(undefined);

					// ACT
					await state.moveTask('t1', 'c2', 99);

					// ASSERT
					expect(repo.moveTask).toHaveBeenCalledWith('t1', 'c2', 1000);
				});

				it('should move task to empty column with default position', async () => {
					// ARRANGE
					const emptyCol: Column = {
						id: 'c3',
						title: 'Пустая задача',
						color: 'slate',
						taskLimit: 10,
						position: 2,
					};
					(repo.fetchColumns as Mock).mockResolvedValue([...mockColumns, emptyCol]);
					(repo.fetchTasks as Mock).mockResolvedValue(mockTasks);
					(repo.moveTask as Mock).mockResolvedValue(undefined);

					await state.loadData();

					// ACT
					await state.moveTask('t1', 'c3', 0);

					// ASSERT
					expect(repo.moveTask).toHaveBeenCalledWith('t1', 'c3', 1000);
				});

				it('should do nothing when task is not found', async () => {
					// ACT
					await state.moveTask('t999', 'c2', 0);

					// ASSERT
					expect(repo.moveTask).not.toHaveBeenCalled();
				});

				it('should rollback move when request fails', async () => {
					// ARRANGE
					(repo.moveTask as Mock).mockRejectedValue(new Error('fail'));

					const listener = vi.fn();
					state.subscribeTasks(listener);
					const before = listener.mock.calls.at(-1)?.[0];
					listener.mockClear();

					// ACT
					await state.moveTask('t1', 'c2', 0);

					// ASSERT
					expect(listener).toHaveBeenLastCalledWith(before);
					expect(notifier.setNotice).toHaveBeenCalledWith(MESSAGES.tasks.moveError, 'error');
				});
			});

			describe('deleteTask', () => {
				it('should delete task when request succeeds', async () => {
					// ARRANGE
					(repo.deleteTask as Mock).mockResolvedValue(undefined);

					const listener = vi.fn();
					state.subscribeTasks(listener);
					listener.mockClear();

					// ACT
					await state.deleteTask('t1');

					// ASSERT
					const tasks: any[] = listener.mock.calls.at(-1)?.[0];
					expect(tasks.find((task) => task.id === 't1')).toBeUndefined();
					expect(repo.deleteTask).toHaveBeenCalledWith('t1');
					expect(notifier.setNotice).toHaveBeenCalledWith(MESSAGES.tasks.deleted, 'success');
				});

				it('should rollback deletion when request fails', async () => {
					// ARRANGE
					(repo.deleteTask as Mock).mockRejectedValue(new Error('fail'));

					const listener = vi.fn();
					state.subscribeTasks(listener);
					const before = listener.mock.calls.at(-1)?.[0];
					listener.mockClear();

					// ACT
					await state.deleteTask('t1');

					// ASSERT
					expect(listener).toHaveBeenLastCalledWith(before);
					expect(notifier.setNotice).toHaveBeenCalledWith(MESSAGES.tasks.deleteError, 'error');
				});
			});
		});
	});

	// SUBSCRIPTIONS
	describe('subscriptions', () => {
		let state: ReturnType<typeof createState>;
		let repo: IKanbanRepo;

		describe('subscribeColumns / subscribeColumns unsubscribe', () => {
			beforeEach(async () => {
				const initialized = await createInitializedState();
				state = initialized.state;
				repo = initialized.repo;
			});

			it('should call listener immediately with current state when subscribing', async () => {
				// ARRANGE
				const listener = vi.fn();

				// ACT
				state.subscribeColumns(listener);

				// ASSERT
				expect(listener).toHaveBeenCalledWith(mockColumns);
			});

			it('should stop notifying after unsubscribe', async () => {
				// ARRANGE
				(repo.addColumn as Mock).mockResolvedValue({
					id: 'c5',
					title: 'Готово',
					color: 'slate',
					taskLimit: 10,
					position: 4,
				});

				const listener = vi.fn();
				const unsubscribe = state.subscribeColumns(listener);
				listener.mockClear();

				// ACT
				unsubscribe();
				await state.addColumn('Готово', 'slate', 10);

				// ASSERT
				expect(listener).not.toHaveBeenCalled();
			});
		});

		describe('subscribeTasks / unsubscribe', () => {
			beforeEach(async () => {
				const initialized = await createInitializedState();
				state = initialized.state;
				repo = initialized.repo;
			});

			it('should call listener immediately with current state when subscribing', async () => {
				// ARRANGE
				const listener = vi.fn();

				// ACT
				state.subscribeTasks(listener);

				// ASSERT
				expect(listener).toHaveBeenCalledWith(mockTasks);
			});

			it('should stop notifying after unsubscribe', async () => {
				// ARRANGE
				(repo.deleteTask as Mock).mockResolvedValue(undefined);

				const listener = vi.fn();
				const unsubscribe = state.subscribeTasks(listener);
				listener.mockClear();

				// ACT
				unsubscribe();
				await state.deleteTask('t1');

				// ASSERT
				expect(listener).not.toHaveBeenCalled();
			});
		});
	});
});
