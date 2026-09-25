import { beforeEach, describe, expect, it, type Mock, vi } from 'vitest';

import { api } from '@/shared/api';

import { KanbanRepoLaravel } from '.';

vi.mock('@/shared/api', () => ({
	api: {
		get: vi.fn(),
		post: vi.fn(),
		patch: vi.fn(),
		delete: vi.fn(),
	},
}));

beforeEach(() => {
	vi.clearAllMocks();
});

describe('KanbanRepoLaravel', () => {
	describe('fetchColumns', () => {
		it('should return columns when request succeeds', async () => {
			// ARRANGE
			(api.get as Mock).mockResolvedValue({
				data: {
					columns: [
						{
							id: 'c1',
							title: 'Запланировано',
							color: 'slate',
							task_limit: 10,
							position: 1000,
						},
					],
				},
			});

			const repo = new KanbanRepoLaravel();

			// ACT
			const result = await repo.fetchColumns();

			// ASSERT
			expect(api.get).toHaveBeenCalledWith('/kanban/columns');

			expect(result).toEqual([
				{
					id: 'c1',
					title: 'Запланировано',
					color: 'slate',
					taskLimit: 10,
					position: 1000,
				},
			]);
		});

		it('should throw error when request fails', async () => {
			// ARRANGE
			(api.get as Mock).mockRejectedValue(new Error());

			const repo = new KanbanRepoLaravel();

			// ACT + ASSERT
			await expect(repo.fetchColumns()).rejects.toBeInstanceOf(Error);
		});
	});

	describe('addColumn', () => {
		it('should add column and return it when request succeeds', async () => {
			// ARRANGE
			(api.post as Mock).mockResolvedValue({
				data: {
					column: {
						id: 'c5',
						title: 'Новая',
						color: 'slate',
						task_limit: 10,
						position: 5000,
					},
				},
			});

			const repo = new KanbanRepoLaravel();

			const column = {
				title: 'Новая',
				color: 'slate' as const,
				taskLimit: 10,
				position: 5000,
			};

			// ACT
			const result = await repo.addColumn(column);

			// ASSERT
			expect(api.post).toHaveBeenCalledWith('/kanban/columns', {
				title: 'Новая',
				color: 'slate',
				task_limit: 10,
				position: 5000,
			});

			expect(result).toEqual({
				id: 'c5',
				title: 'Новая',
				color: 'slate',
				taskLimit: 10,
				position: 5000,
			});
		});
	});

	describe('editColumn', () => {
		it('should update column and return it when request succeeds', async () => {
			// ARRANGE
			(api.patch as Mock).mockResolvedValue({
				data: {
					column: {
						id: 'c1',
						title: 'Обновлено',
						color: 'rose',
						task_limit: 20,
						position: 1000,
					},
				},
			});

			const repo = new KanbanRepoLaravel();

			const column = {
				title: 'Обновлено',
				color: 'rose' as const,
				taskLimit: 20,
			};

			// ACT
			const result = await repo.editColumn('c1', column);

			// ASSERT
			expect(api.patch).toHaveBeenCalledWith('/kanban/columns/c1', {
				title: 'Обновлено',
				color: 'rose',
				task_limit: 20,
			});

			expect(result).toEqual({
				id: 'c1',
				title: 'Обновлено',
				color: 'rose',
				taskLimit: 20,
				position: 1000,
			});
		});
	});

	describe('deleteColumn', () => {
		it('should delete column when request succeeds', async () => {
			// ARRANGE
			(api.delete as Mock).mockResolvedValue({});

			const repo = new KanbanRepoLaravel();

			// ACT
			await repo.deleteColumn('c1');

			// ASSERT
			expect(api.delete).toHaveBeenCalledWith('/kanban/columns/c1');
		});
	});

	describe('moveColumn', () => {
		it('should move column and return it when request succeeds', async () => {
			// ARRANGE
			(api.patch as Mock).mockResolvedValue({
				data: {
					column: {
						id: 'c1',
						title: 'Запланировано',
						color: 'slate',
						task_limit: 10,
						position: 2500,
					},
				},
			});

			const repo = new KanbanRepoLaravel();

			// ACT
			const result = await repo.moveColumn('c1', 2500);

			// ASSERT
			expect(api.patch).toHaveBeenCalledWith('/kanban/columns/c1/position', {
				position: 2500,
			});

			expect(result).toEqual({
				id: 'c1',
				title: 'Запланировано',
				color: 'slate',
				taskLimit: 10,
				position: 2500,
			});
		});
	});

	describe('fetchTasks', () => {
		it('should return tasks when request succeeds', async () => {
			// ARRANGE
			(api.get as Mock).mockResolvedValue({
				data: {
					tasks: [
						{
							id: 't1',
							column_id: 'c1',
							title: 'Задача',
							description: 'Описание',
							status: 'active',
							priority: 'medium',
							start_date: '2026-09-26',
							end_date: null,
							completed: false,
							position: 1000,
							created_at: '2026-09-26T10:00:00.000Z',
							updated_at: null,
						},
					],
				},
			});

			const repo = new KanbanRepoLaravel();

			// ACT
			const result = await repo.fetchTasks();

			// ASSERT
			expect(api.get).toHaveBeenCalledWith('/kanban/tasks');

			expect(result).toEqual([
				{
					id: 't1',
					columnId: 'c1',
					title: 'Задача',
					description: 'Описание',
					status: 'active',
					priority: 'medium',
					startDate: '2026-09-26',
					endDate: null,
					completed: false,
					position: 1000,
					createdAt: '2026-09-26T10:00:00.000Z',
					updatedAt: null,
				},
			]);
		});

		it('should throw error when request fails', async () => {
			// ARRANGE
			(api.get as Mock).mockRejectedValue(new Error());

			const repo = new KanbanRepoLaravel();

			// ACT + ASSERT
			await expect(repo.fetchTasks()).rejects.toBeInstanceOf(Error);
		});
	});

	describe('addTask', () => {
		it('should add task and return it when request succeeds', async () => {
			// ARRANGE
			(api.post as Mock).mockResolvedValue({
				data: {
					task: {
						id: 't1',
						column_id: 'c1',
						title: 'Новая задача',
						description: '',
						status: 'active',
						priority: 'medium',
						start_date: '2026-09-26',
						end_date: null,
						completed: false,
						position: 1000,
						created_at: '2026-09-26T10:00:00.000Z',
						updated_at: null,
					},
				},
			});

			const repo = new KanbanRepoLaravel();

			const task = {
				columnId: 'c1',
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
			expect(api.post).toHaveBeenCalledWith('/kanban/tasks', {
				column_id: 'c1',
				title: 'Новая задача',
				description: '',
				status: 'active',
				priority: 'medium',
				start_date: '2026-09-26',
				end_date: null,
				completed: false,
				position: 1000,
			});

			expect(result).toEqual({
				id: 't1',
				columnId: 'c1',
				title: 'Новая задача',
				description: '',
				status: 'active',
				priority: 'medium',
				startDate: '2026-09-26',
				endDate: null,
				completed: false,
				position: 1000,
				createdAt: '2026-09-26T10:00:00.000Z',
				updatedAt: null,
			});
		});
	});

	describe('editTask', () => {
		it('should update task and return it when request succeeds', async () => {
			// ARRANGE
			(api.patch as Mock).mockResolvedValue({
				data: {
					task: {
						id: 't1',
						column_id: 'c1',
						title: 'Обновлённая задача',
						description: 'Новое описание',
						status: 'paused',
						priority: 'high',
						start_date: '2026-09-26',
						end_date: '2026-09-27',
						completed: true,
						position: 1000,
						created_at: '2026-09-26T10:00:00.000Z',
						updated_at: '2026-09-26T11:00:00.000Z',
					},
				},
			});

			const repo = new KanbanRepoLaravel();

			const task = {
				title: 'Обновлённая задача',
				description: 'Новое описание',
				status: 'paused' as const,
				priority: 'high' as const,
				startDate: '2026-09-26',
				endDate: '2026-09-27',
				completed: true,
				updatedAt: '2026-09-26T11:00:00.000Z',
			};

			// ACT
			const result = await repo.editTask('t1', task);

			// ASSERT
			expect(api.patch).toHaveBeenCalledWith('/kanban/tasks/t1', {
				title: 'Обновлённая задача',
				description: 'Новое описание',
				status: 'paused',
				priority: 'high',
				start_date: '2026-09-26',
				end_date: '2026-09-27',
				completed: true,
				updated_at: '2026-09-26T11:00:00.000Z',
			});

			expect(result).toEqual({
				id: 't1',
				columnId: 'c1',
				title: 'Обновлённая задача',
				description: 'Новое описание',
				status: 'paused',
				priority: 'high',
				startDate: '2026-09-26',
				endDate: '2026-09-27',
				completed: true,
				position: 1000,
				createdAt: '2026-09-26T10:00:00.000Z',
				updatedAt: '2026-09-26T11:00:00.000Z',
			});
		});
	});

	describe('deleteTask', () => {
		it('should delete task when request succeeds', async () => {
			// ARRANGE
			(api.delete as Mock).mockResolvedValue({});

			const repo = new KanbanRepoLaravel();

			// ACT
			await repo.deleteTask('t1');

			// ASSERT
			expect(api.delete).toHaveBeenCalledWith('/kanban/tasks/t1');
		});
	});

	describe('moveTask', () => {
		it('should move task and return it when request succeeds', async () => {
			// ARRANGE
			(api.patch as Mock).mockResolvedValue({
				data: {
					task: {
						id: 't1',
						column_id: 'c2',
						title: 'Задача',
						description: '',
						status: 'active',
						priority: 'medium',
						start_date: '2026-09-26',
						end_date: null,
						completed: false,
						position: 2500,
						created_at: '2026-09-26T10:00:00.000Z',
						updated_at: '2026-09-26T11:00:00.000Z',
					},
				},
			});

			const repo = new KanbanRepoLaravel();

			// ACT
			const result = await repo.moveTask('t1', 'c2', 2500, '2026-09-26T11:00:00.000Z');

			// ASSERT
			expect(api.patch).toHaveBeenCalledWith('/kanban/tasks/t1/position', {
				column_id: 'c2',
				position: 2500,
				updated_at: '2026-09-26T11:00:00.000Z',
			});

			expect(result.columnId).toBe('c2');
			expect(result.position).toBe(2500);
			expect(result.updatedAt).toBe('2026-09-26T11:00:00.000Z');
		});
	});
});
