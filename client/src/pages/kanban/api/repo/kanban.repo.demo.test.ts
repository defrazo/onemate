import { describe, expect, it } from 'vitest';

import { MESSAGES } from '../../lib';
import { KanbanRepoDemo } from '.';

describe('KanbanRepoDemo', () => {
	it('should create default columns', async () => {
		// ARRANGE
		const repo = new KanbanRepoDemo();

		// ACT
		const result = await repo.fetchColumns();

		// ASSERT
		expect(result.length).toBeGreaterThan(0);
		expect(result[0]).toHaveProperty('id');
		expect(result[0]).toHaveProperty('title');
	});

	it('should create default tasks', async () => {
		// ARRANGE
		const repo = new KanbanRepoDemo();

		// ACT
		const result = await repo.fetchTasks();

		// ASSERT
		expect(result.length).toBeGreaterThan(0);
		expect(result[0]).toHaveProperty('id');
		expect(result[0]).toHaveProperty('title');
		expect(result[0]).toHaveProperty('createdAt');
		expect(result[0].updatedAt).toBeNull();
	});

	it('should add column', async () => {
		// ARRANGE
		const repo = new KanbanRepoDemo();

		const column = { title: 'Новая колонка', color: 'slate' as const, taskLimit: 10, position: 5000 };

		// ACT
		const result = await repo.addColumn(column);

		// ASSERT
		expect(result).toMatchObject(column);
		expect(result.id).toBeDefined();
	});

	it('should update column', async () => {
		// ARRANGE
		const repo = new KanbanRepoDemo();

		const columns = await repo.fetchColumns();
		const columnId = columns[0].id;

		// ACT
		const result = await repo.editColumn(columnId, { title: 'Обновлено', color: 'rose', taskLimit: 20 });

		// ASSERT
		expect(result.title).toBe('Обновлено');
		expect(result.color).toBe('rose');
		expect(result.taskLimit).toBe(20);
	});

	it('should throw when updating unknown column', async () => {
		// ARRANGE
		const repo = new KanbanRepoDemo();

		// ACT
		const action = repo.editColumn('unknown', { title: 'Обновлено', color: 'rose', taskLimit: 20 });

		// ASSERT
		await expect(action).rejects.toThrow(MESSAGES.columns.updateError);
	});

	it('should delete column', async () => {
		// ARRANGE
		const repo = new KanbanRepoDemo();

		const columns = await repo.fetchColumns();
		const columnId = columns[0].id;

		// ACT
		await repo.deleteColumn(columnId);

		const result = await repo.fetchColumns();

		// ASSERT
		expect(result.find((column) => column.id === columnId)).toBeUndefined();
	});

	it('should move column', async () => {
		// ARRANGE
		const repo = new KanbanRepoDemo();

		const columns = await repo.fetchColumns();
		const columnId = columns[0].id;

		// ACT
		const result = await repo.moveColumn(columnId, 2500);

		// ASSERT
		expect(result.position).toBe(2500);

		const updatedColumns = await repo.fetchColumns();
		expect(updatedColumns.find((column) => column.id === columnId)?.position).toBe(2500);
	});

	it('should throw when moving unknown column', async () => {
		// ARRANGE
		const repo = new KanbanRepoDemo();

		// ACT
		const action = repo.moveColumn('unknown', 2500);

		// ASSERT
		await expect(action).rejects.toThrow(MESSAGES.columns.moveError);
	});

	it('should add task', async () => {
		// ARRANGE
		const repo = new KanbanRepoDemo();

		const columns = await repo.fetchColumns();

		const task = {
			columnId: columns[0].id,
			title: 'Новая задача',
			description: '',
			status: 'active' as const,
			priority: 'medium' as const,
			startDate: '2026-09-26',
			endDate: null,
			completed: false,
			position: 1000,
		};

		// ACT
		const result = await repo.addTask(task);

		// ASSERT
		expect(result).toMatchObject(task);
		expect(result.id).toBeDefined();
		expect(result.createdAt).toBeDefined();
		expect(result.updatedAt).toBeNull();
	});

	it('should update task', async () => {
		// ARRANGE
		const repo = new KanbanRepoDemo();

		const tasks = await repo.fetchTasks();
		const taskId = tasks[0].id;

		const task = {
			title: 'Обновлённая задача',
			description: 'Новое описание',
			status: 'paused' as const,
			priority: 'high' as const,
			startDate: '2026-09-26',
			endDate: '2026-09-27',
			completed: true,
			updatedAt: '2026-09-26T10:00:00.000Z',
		};

		// ACT
		const result = await repo.editTask(taskId, task);

		// ASSERT
		expect(result).toMatchObject(task);

		const updatedTasks = await repo.fetchTasks();
		expect(updatedTasks.find((item) => item.id === taskId)).toMatchObject(task);
	});

	it('should throw when updating unknown task', async () => {
		// ARRANGE
		const repo = new KanbanRepoDemo();

		// ACT
		const action = repo.editTask('unknown', {
			title: 'Обновлённая задача',
			description: '',
			status: 'active',
			priority: 'medium',
			startDate: '2026-09-26',
			endDate: null,
			completed: false,
			updatedAt: '2026-09-26T10:00:00.000Z',
		});

		// ASSERT
		await expect(action).rejects.toThrow(MESSAGES.tasks.updateError);
	});

	it('should delete task', async () => {
		// ARRANGE
		const repo = new KanbanRepoDemo();

		const tasks = await repo.fetchTasks();
		const taskId = tasks[0].id;

		// ACT
		await repo.deleteTask(taskId);

		const result = await repo.fetchTasks();

		// ASSERT
		expect(result.find((task) => task.id === taskId)).toBeUndefined();
	});

	it('should move task', async () => {
		// ARRANGE
		const repo = new KanbanRepoDemo();

		const columns = await repo.fetchColumns();
		const tasks = await repo.fetchTasks();

		const taskId = tasks[0].id;
		const columnId = columns[1].id;
		const updatedAt = '2026-09-26T10:00:00.000Z';

		// ACT
		const result = await repo.moveTask(taskId, columnId, 2500, updatedAt);

		// ASSERT
		expect(result.columnId).toBe(columnId);
		expect(result.position).toBe(2500);
		expect(result.updatedAt).toBe(updatedAt);

		const updatedTasks = await repo.fetchTasks();
		expect(updatedTasks.find((task) => task.id === taskId)).toMatchObject({ columnId, position: 2500, updatedAt });
	});

	it('should throw when moving unknown task', async () => {
		// ARRANGE
		const repo = new KanbanRepoDemo();

		const columns = await repo.fetchColumns();

		// ACT
		const action = repo.moveTask('unknown', columns[0].id, 1000, '2026-09-26T10:00:00.000Z');

		// ASSERT
		await expect(action).rejects.toThrow(MESSAGES.tasks.moveError);
	});
});
