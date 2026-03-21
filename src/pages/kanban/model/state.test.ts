import { beforeEach, describe, expect, it, type Mock, vi } from 'vitest';

import {
	addColumnApi,
	addTaskApi,
	deleteColumnApi,
	deleteTaskApi,
	editColumnApi,
	editTaskApi,
	fetchColumnsApi,
	fetchTasksApi,
	moveColumnApi,
	moveTaskApi,
} from '../api';
import { getDefaultColumns, getDefaultTasks, MESSAGES, notifier } from '../lib';
import { Column, createState, Task } from '.';

vi.mock('../api', () => ({
	fetchColumnsApi: vi.fn(),
	addColumnApi: vi.fn(),
	editColumnApi: vi.fn(),
	deleteColumnApi: vi.fn(),
	moveColumnApi: vi.fn(),
	fetchTasksApi: vi.fn(),
	addTaskApi: vi.fn(),
	editTaskApi: vi.fn(),
	deleteTaskApi: vi.fn(),
	moveTaskApi: vi.fn(),
}));

vi.mock('../lib', async (importOriginal) => {
	const actual = await importOriginal<typeof import('../lib')>();

	return {
		...actual,
		getDefaultColumns: vi.fn(),
		getDefaultTasks: vi.fn(),
		notifier: { setNotice: vi.fn() },
	};
});

const mockColumns: Column[] = [
	{ id: 'c1', title: 'Запланировано', position: 0, taskLimit: 10, color: 'slate' },
	{ id: 'c2', title: 'Подготовка', position: 1, taskLimit: 10, color: 'amber' },
	{ id: 'c3', title: 'В работе', position: 2, taskLimit: 10, color: 'rose' },
	{ id: 'c4', title: 'Завершено', position: 3, taskLimit: 10, color: 'lime' },
];

const mockTasks: Task[] = [
	{
		id: 't1',
		title: 'Задача 1',
		description: 'Описание задачи',
		columnId: 'c1',
		status: 'waiting',
		priority: 'high',
		position: 0,
		date: '18.03.2026, 10:00',
		startDate: '2026-03-18',
		endDate: '2026-03-20',
	},
	{
		id: 't2',
		title: 'Задача 2',
		description: 'Описание задачи',
		columnId: 'c1',
		status: 'active',
		priority: 'medium',
		position: 0,
		date: '18.03.2026, 10:00',
		startDate: '2026-03-18',
		endDate: '2026-03-20',
	},
];

const createInitializedState = async () => {
	(fetchColumnsApi as Mock).mockResolvedValue(mockColumns);
	(fetchTasksApi as Mock).mockResolvedValue(mockTasks);

	const state = createState();
	await state.init();

	return state;
};

describe('state', () => {
	beforeEach(() => vi.clearAllMocks());

	describe('columns', () => {
		let state: ReturnType<typeof createState>;

		describe('fetchColumns', () => {
			beforeEach(() => (state = createState()));

			it('should notify subscribers with columns when request succeeds', async () => {
				// ARRANGE
				(fetchColumnsApi as Mock).mockResolvedValue(mockColumns);
				(fetchTasksApi as Mock).mockResolvedValue([]);

				const listener = vi.fn();
				state.subscribeColumns(listener);

				// ACT
				await state.init();

				// ASSERT
				expect(listener).toHaveBeenCalledTimes(2);
				expect(listener).toHaveBeenLastCalledWith(mockColumns);
			});

			it('should create default columns when API returns empty array', async () => {
				// ARRANGE
				const defaultColumns: Omit<Column, 'id'>[] = [
					{ title: 'Новая', position: 0, taskLimit: 10, color: 'slate' },
				];
				(fetchColumnsApi as Mock).mockResolvedValue([]);
				(fetchTasksApi as Mock).mockResolvedValue([]);
				(getDefaultColumns as Mock).mockReturnValue(defaultColumns);
				(addColumnApi as Mock).mockResolvedValue({ id: 'c1', ...defaultColumns[0] });

				// ACT
				await state.init();

				// ASSERT
				expect(addColumnApi).toHaveBeenCalledWith(defaultColumns[0]);
			});

			it('should show error when request fails', async () => {
				// ARRANGE
				(fetchColumnsApi as Mock).mockRejectedValue(new Error('network'));
				(fetchTasksApi as Mock).mockResolvedValue([]);

				// ACT
				await state.init();

				// ASSERT
				expect(notifier.setNotice).toHaveBeenCalledWith(MESSAGES.columns.fetchError, 'error');
			});
		});

		describe('actions', () => {
			beforeEach(async () => (state = await createInitializedState()));

			describe('addColumn', () => {
				it('should add column and notify subscribers when request succeeds', async () => {
					// ARRANGE
					const newColumn: Column = { id: 'c3', title: 'Готово', position: 4, taskLimit: 0, color: 'slate' };
					(addColumnApi as Mock).mockResolvedValue(newColumn);

					const listener = vi.fn();
					state.subscribeColumns(listener);
					listener.mockClear();

					// ACT
					await state.addColumn('Готово', 0, 'slate');

					// ASSERT
					expect(addColumnApi).toHaveBeenCalledWith({
						title: 'Готово',
						position: 4,
						taskLimit: 0,
						color: 'slate',
					});
					expect(listener).toHaveBeenCalledTimes(1);
					expect(state.getColumns()).toContainEqual(newColumn);
					expect(notifier.setNotice).toHaveBeenCalledWith(MESSAGES.columns.added, 'success');
				});

				it('should rollback state when request fails', async () => {
					// ARRANGE
					(addColumnApi as Mock).mockRejectedValue(new Error('fail'));

					const columnsBefore = state.getColumns();

					// ACT
					await state.addColumn('Сломанная', 0, 'sky');

					// ASSERT
					expect(state.getColumns()).toEqual(columnsBefore);
					expect(notifier.setNotice).toHaveBeenCalledWith(MESSAGES.columns.addError, 'error');
				});
			});

			describe('editColumn', () => {
				it('should update column optimistically when request succeeds', async () => {
					// ARRANGE
					(editColumnApi as Mock).mockResolvedValue(undefined);

					// ACT
					await state.editColumn('c1', 'Переделать', 7, 'sky');

					// ASSERT
					const updated = state.getColumns().find((column) => column.id === 'c1');
					expect(updated).toMatchObject({ title: 'Переделать', taskLimit: 7, color: 'sky' });
					expect(editColumnApi).toHaveBeenCalledWith('c1', {
						title: 'Переделать',
						taskLimit: 7,
						color: 'sky',
					});
					expect(notifier.setNotice).toHaveBeenCalledWith(MESSAGES.columns.updated, 'success');
				});

				it('should rollback changes when request fails', async () => {
					// ARRANGE
					(editColumnApi as Mock).mockRejectedValue(new Error('fail'));
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
				it('should delete column with its tasks when request succeeds', async () => {
					// ARRANGE
					(deleteColumnApi as Mock).mockResolvedValue(undefined);
					(deleteTaskApi as Mock).mockResolvedValue(undefined);

					// ACT
					await state.deleteColumn('c1');

					// ASSERT
					expect(state.getColumns().find((column) => column.id === 'c1')).toBeUndefined();
					expect(deleteTaskApi).toHaveBeenCalledWith('t1');
					expect(deleteColumnApi).toHaveBeenCalledWith('c1');
					expect(notifier.setNotice).toHaveBeenCalledWith(MESSAGES.columns.deleted, 'success');
				});

				it('should rollback deletion when request fails', async () => {
					// ARRANGE
					(deleteColumnApi as Mock).mockRejectedValue(new Error('fail'));
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
					(moveColumnApi as Mock).mockResolvedValue(undefined);

					// ACT
					await state.moveColumn('c2', 0);

					// ASSERT
					const cols = state.getColumns();
					expect(cols[0].id).toBe('c2');
					expect(cols[1].id).toBe('c1');
					expect(cols[0].position).toBe(0);
					expect(cols[1].position).toBe(1);
					expect(moveColumnApi).toHaveBeenCalledTimes(5);
					expect(notifier.setNotice).toHaveBeenCalledWith(MESSAGES.columns.moved, 'success');
				});

				it('should do nothing when oldIndex equals newIndex', async () => {
					// ACT
					await state.moveColumn('c1', 0);

					// ASSERT
					expect(moveColumnApi).not.toHaveBeenCalled();
				});

				it('should rollback reorder when request fails', async () => {
					// ARRANGE
					(moveColumnApi as Mock).mockRejectedValue(new Error('fail'));
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

		describe('fetchTasks', () => {
			beforeEach(() => (state = createState()));

			it('should notify subscribers with tasks when request succeeds', async () => {
				// ARRANGE
				(fetchColumnsApi as Mock).mockResolvedValue(mockColumns);
				(fetchTasksApi as Mock).mockResolvedValue(mockTasks);

				const listener = vi.fn();
				state.subscribeTasks(listener);

				// ACT
				await state.init();

				// ASSERT
				expect(listener).toHaveBeenCalledTimes(2);
				expect(listener).toHaveBeenLastCalledWith(mockTasks);
			});

			it('should create default tasks when API returns empty array', async () => {
				// ARRANGE
				const defaultTask: Omit<Task, 'id'> = {
					title: 'Задача 0',
					description: 'Описание задачи',
					columnId: 'c1',
					status: 'waiting',
					priority: 'high',
					position: 0,
					date: '18.03.2026, 10:00',
					startDate: '2026-03-18',
					endDate: '2026-03-20',
				};

				(fetchColumnsApi as Mock).mockResolvedValue(mockColumns);
				(fetchTasksApi as Mock).mockResolvedValue([]);
				(getDefaultTasks as Mock).mockReturnValue([defaultTask]);
				(addTaskApi as Mock).mockResolvedValue({ id: 't3', ...defaultTask });

				// ACT
				await state.init();

				// ASSERT
				expect(addTaskApi).toHaveBeenCalledWith(defaultTask);
			});

			it('should show error when request fails', async () => {
				// ARRANGE
				(fetchColumnsApi as Mock).mockResolvedValue(mockColumns);
				(fetchTasksApi as Mock).mockRejectedValue(new Error('network'));

				// ACT
				await state.init();

				// ASSERT
				expect(notifier.setNotice).toHaveBeenCalledWith(MESSAGES.tasks.fetchError, 'error');
			});
		});

		describe('actions', () => {
			beforeEach(async () => (state = await createInitializedState()));

			describe('addTask', () => {
				it('should add task and notify subscribers when request succeeds', async () => {
					// ARRANGE
					const newTask: Task = {
						id: 't3',
						title: 'Задача 3',
						description: 'Описание',
						columnId: 'c1',
						status: 'waiting',
						priority: 'high',
						position: 2,
						date: '18.03.2026, 10:00',
						startDate: '2026-03-18',
						endDate: null,
					};
					(addTaskApi as Mock).mockResolvedValue(newTask);

					const listener = vi.fn();
					state.subscribeTasks(listener);
					listener.mockClear();

					// ACT
					await state.addTask(
						'Задача 3',
						'Описание',
						'waiting',
						'high',
						'c1',
						'18.03.2026, 10:00',
						'2026-03-18',
						null
					);

					// ASSERT
					expect(addTaskApi).toHaveBeenCalledWith(
						expect.objectContaining({ title: 'Задача 3', columnId: 'c1', position: 1 })
					);
					expect(listener).toHaveBeenCalledTimes(1);
					expect(notifier.setNotice).toHaveBeenCalledWith(MESSAGES.tasks.added, 'success');
				});

				it('should rollback state when request fails', async () => {
					// ARRANGE
					(addTaskApi as Mock).mockRejectedValue(new Error('fail'));

					const listener = vi.fn();
					state.subscribeTasks(listener);
					const tasksBefore = listener.mock.calls.at(-1)?.[0];
					listener.mockClear();

					// ACT
					await state.addTask('Задача 3', '', 'active', 'low', 'c1', '', '', null);

					// ASSERT
					expect(listener).toHaveBeenLastCalledWith(tasksBefore);
					expect(notifier.setNotice).toHaveBeenCalledWith(MESSAGES.tasks.addError, 'error');
				});
			});

			describe('editTask', () => {
				it('should update task optimistically when request succeeds', async () => {
					// ARRANGE
					(editTaskApi as Mock).mockResolvedValue(undefined);

					// ACT
					await state.editTask(
						't1',
						'Задача 3',
						'Новое описание задачи',
						'active',
						'high',
						'2024-02-01',
						'2024-02-01',
						'2024-02-10'
					);

					// ASSERT
					expect(editTaskApi).toHaveBeenCalledWith('t1', {
						title: 'Задача 3',
						description: 'Новое описание задачи',
						status: 'active',
						priority: 'high',
						date: '2024-02-01',
						startDate: '2024-02-01',
						endDate: '2024-02-10',
					});
					expect(notifier.setNotice).toHaveBeenCalledWith(MESSAGES.tasks.updated, 'success');
				});

				it('should rollback changes when request fails', async () => {
					// ARRANGE
					(editTaskApi as Mock).mockRejectedValue(new Error('fail'));

					const listener = vi.fn();
					state.subscribeTasks(listener);
					const before = listener.mock.calls.at(-1)?.[0];
					listener.mockClear();

					// ACT
					await state.editTask('t1', 'Задача 3', '', 'active', 'low', '', '', null);

					// ASSERT
					expect(listener).toHaveBeenLastCalledWith(before);
					expect(notifier.setNotice).toHaveBeenCalledWith(MESSAGES.tasks.updateError, 'error');
				});
			});

			describe('moveTask', () => {
				it('should move task to another column when request succeeds', async () => {
					// ARRANGE
					(moveTaskApi as Mock).mockResolvedValue(undefined);

					const listener = vi.fn();
					state.subscribeTasks(listener);
					listener.mockClear();

					// ACT
					await state.moveTask('t1', 'c2', 0);

					// ASSERT
					expect(moveTaskApi).toHaveBeenCalledWith('t1', 'c2', expect.any(Number));
					expect(notifier.setNotice).toHaveBeenCalledWith(MESSAGES.tasks.moved, 'success');

					const tasks: any[] = listener.mock.calls.at(-1)?.[0];
					const moved = tasks.find((task: Task) => task.id === 't1');
					expect(moved?.columnId).toBe('c2');
				});

				it('should move task to end when index exceeds length', async () => {
					// ARRANGE
					(moveTaskApi as Mock).mockResolvedValue(undefined);

					// ACT
					await state.moveTask('t1', 'c2', 99);

					// ASSERT
					expect(moveTaskApi).toHaveBeenCalledWith('t1', 'c2', 1000);
				});

				it('should move task to empty column with default position', async () => {
					// ARRANGE
					const emptyCol: Column = {
						id: 'c3',
						title: 'Пустая задача',
						position: 2,
						taskLimit: 10,
						color: 'slate',
					};
					(fetchColumnsApi as Mock).mockResolvedValue([...mockColumns, emptyCol]);
					(fetchTasksApi as Mock).mockResolvedValue(mockTasks);
					(moveTaskApi as Mock).mockResolvedValue(undefined);

					await state.init();

					// ACT
					await state.moveTask('t1', 'c3', 0);

					// ASSERT
					expect(moveTaskApi).toHaveBeenCalledWith('t1', 'c3', 1000);
				});

				it('should do nothing when task is not found', async () => {
					// ACT
					await state.moveTask('t999', 'c2', 0);

					// ASSERT
					expect(moveTaskApi).not.toHaveBeenCalled();
				});

				it('should rollback move when request fails', async () => {
					// ARRANGE
					(moveTaskApi as Mock).mockRejectedValue(new Error('fail'));

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
					(deleteTaskApi as Mock).mockResolvedValue(undefined);

					const listener = vi.fn();
					state.subscribeTasks(listener);
					listener.mockClear();

					// ACT
					await state.deleteTask('t1');

					// ASSERT
					const tasks: any[] = listener.mock.calls.at(-1)?.[0];
					expect(tasks.find((task) => task.id === 't1')).toBeUndefined();
					expect(deleteTaskApi).toHaveBeenCalledWith('t1');
					expect(notifier.setNotice).toHaveBeenCalledWith(MESSAGES.tasks.deleted, 'success');
				});

				it('should rollback deletion when request fails', async () => {
					// ARRANGE
					(deleteTaskApi as Mock).mockRejectedValue(new Error('fail'));

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

		describe('subscribeColumns / subscribeColumns unsubscribe', () => {
			beforeEach(async () => (state = await createInitializedState()));

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
				(addColumnApi as Mock).mockResolvedValue({
					id: 'c5',
					title: 'Готово',
					position: 4,
					taskLimit: 10,
					color: 'slate',
				});

				const listener = vi.fn();
				const unsubscribe = state.subscribeColumns(listener);
				listener.mockClear();

				// ACT
				unsubscribe();
				await state.addColumn('Готово', 10, 'slate');

				// ASSERT
				expect(listener).not.toHaveBeenCalled();
			});
		});

		describe('subscribeTasks / unsubscribe', () => {
			beforeEach(async () => (state = await createInitializedState()));

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
				(deleteTaskApi as Mock).mockResolvedValue(undefined);

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
