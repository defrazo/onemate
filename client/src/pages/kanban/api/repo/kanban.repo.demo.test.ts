import { describe, expect, it } from 'vitest';

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
	});

	it('should add column', async () => {
		// ARRANGE
		const repo = new KanbanRepoDemo();

		const column = {
			title: 'Новая колонка',
			color: 'slate' as const,
			taskLimit: 10,
			position: 5000,
		};

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
		const result = await repo.editColumn(columnId, {
			title: 'Обновлено',
			color: 'rose',
			taskLimit: 20,
		});

		// ASSERT
		expect(result.title).toBe('Обновлено');
		expect(result.color).toBe('rose');
		expect(result.taskLimit).toBe(20);
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
			startDate: '',
			endDate: null,
			completed: false,
			position: 1000,
		};

		// ACT
		const result = await repo.addTask(task);

		// ASSERT
		expect(result).toMatchObject(task);
		expect(result.id).toBeDefined();
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
});
