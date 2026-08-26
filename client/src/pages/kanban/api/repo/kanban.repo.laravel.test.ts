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
							position: 0,
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
					position: 0,
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
						position: 1000,
					},
				},
			});

			const repo = new KanbanRepoLaravel();

			const column = {
				title: 'Новая',
				color: 'slate' as const,
				taskLimit: 10,
				position: 1000,
			};

			// ACT
			const result = await repo.addColumn(column);

			// ASSERT
			expect(api.post).toHaveBeenCalledWith('/kanban/columns', expect.any(Object));

			expect(result).toEqual({
				id: 'c5',
				title: 'Новая',
				color: 'slate',
				taskLimit: 10,
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

	describe('fetchTasks', () => {
		it('should return tasks when request succeeds', async () => {
			// ARRANGE
			(api.get as Mock).mockResolvedValue({
				data: {
					tasks: [],
				},
			});

			const repo = new KanbanRepoLaravel();

			// ACT
			const result = await repo.fetchTasks();

			// ASSERT
			expect(api.get).toHaveBeenCalledWith('/kanban/tasks');
			expect(result).toEqual([]);
		});
	});

	describe('deleteTask', () => {
		it('should delete task when request succeeds', async () => {
			// ARRANGE
			(api.delete as Mock).mockResolvedValue({});

			const repo = new KanbanRepoLaravel();

			// ACT
			await repo.deleteTask('task-1');

			// ASSERT
			expect(api.delete).toHaveBeenCalledWith('/kanban/tasks/task-1');
		});
	});
});
