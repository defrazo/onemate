import { beforeEach, describe, expect, it, type Mock, vi } from 'vitest';

import { supabase } from '@/shared/lib/supabase';

import type { TaskPriority, TaskStatus } from '../lib';
import type { CreateTaskInput, DbTask, EditTaskInput, Task } from '../model';
import { addTaskApi, deleteTaskApi, editTaskApi, fetchTasksApi, getCurrentUser, moveTaskApi } from '.';

vi.mock('@/shared/lib/supabase', () => ({
	supabase: { from: vi.fn() },
}));

vi.mock('./auth-api', () => ({ getCurrentUser: vi.fn() }));

const MOCKED_NOW = '2026-04-14T10:00:00.000Z';

const mockChain = (methods: string[], result: { data: unknown; error: unknown }) => {
	const last = { [methods.at(-1)!]: vi.fn().mockResolvedValue(result) };

	return methods.slice(0, -1).reduceRight(
		(acc, method) => ({
			[method]: vi.fn().mockReturnValue(acc),
		}),
		last
	);
};

beforeEach(() => {
	vi.clearAllMocks();
	(getCurrentUser as Mock).mockResolvedValue({ id: '1' });
});

describe('fetchTasksApi', () => {
	it('should return tasks when request succeeds', async () => {
		// ARRANGE
		const dbTasks: Omit<DbTask, 'user_id'>[] = [
			{
				id: 't1',
				column_id: 'c1',
				title: 'Обычная задача',
				description: 'Описание задачи',
				status: 'waiting',
				priority: 'high',
				start_date: '2026-03-18',
				end_date: '2026-03-20',
				completed: false,
				position: 0,
				created_at: '18.03.2026, 10:00',
				updated_at: null,
			},
		];

		(supabase.from as Mock).mockReturnValue(mockChain(['select', 'eq', 'order'], { data: dbTasks, error: null }));

		// ACT
		const result = await fetchTasksApi();

		// ASSERT
		expect(result).toEqual([
			{
				id: 't1',
				columnId: 'c1',
				title: 'Обычная задача',
				description: 'Описание задачи',
				status: 'waiting',
				priority: 'high',
				startDate: '2026-03-18',
				endDate: '2026-03-20',
				completed: false,
				position: 0,
				createdAt: '18.03.2026, 10:00',
				updatedAt: null,
			},
		]);
	});

	it('should throw error when API returns error', async () => {
		// ARRANGE
		(supabase.from as Mock).mockReturnValue(
			mockChain(['select', 'eq', 'order'], { data: null, error: new Error() })
		);

		// ACT + ASSERT
		await expect(fetchTasksApi()).rejects.toBeInstanceOf(Error);
	});

	it('should return empty array when API returns null', async () => {
		// ARRANGE
		(supabase.from as Mock).mockReturnValue(mockChain(['select', 'eq', 'order'], { data: null, error: null }));

		// ACT
		const result = await fetchTasksApi();

		// ASSERT
		expect(result).toEqual([]);
	});
});

describe('addTaskApi', () => {
	const taskData: CreateTaskInput = {
		columnId: 'c1',
		title: 'Новая задача',
		description: 'Описание задачи',
		status: 'waiting',
		priority: 'medium',
		startDate: '2026-03-18',
		endDate: '2026-03-20',
		completed: false,
		position: 0,
	};

	it('should add task and return it when request succeeds', async () => {
		// ARRANGE
		const dbTask: Omit<DbTask, 'user_id'> = {
			id: 't2',
			column_id: taskData.columnId,
			title: taskData.title,
			description: taskData.description,
			status: taskData.status,
			priority: taskData.priority,
			start_date: taskData.startDate,
			end_date: taskData.endDate,
			completed: taskData.completed,
			position: taskData.position,
			created_at: '18.03.2026, 14:00',
			updated_at: null,
		};

		(supabase.from as Mock).mockReturnValue(
			mockChain(['insert', 'select', 'single'], { data: dbTask, error: null })
		);

		// ACT
		const result = await addTaskApi(taskData);

		// ASSERT
		expect(result).toMatchObject({ ...taskData, id: 't2' });
		expect(result.createdAt).toEqual(dbTask.created_at);
		expect(result.updatedAt).toBeNull();
	});

	it('should throw error when API returns error', async () => {
		// ARRANGE
		(supabase.from as Mock).mockReturnValue(
			mockChain(['insert', 'select', 'single'], { data: null, error: new Error() })
		);

		// ACT + ASSERT
		await expect(addTaskApi(taskData)).rejects.toBeInstanceOf(Error);
	});
});

describe('editTaskApi', () => {
	const taskId = 't1';
	const taskData: EditTaskInput = {
		title: 'Обновлено',
		description: 'Новое описание',
		status: 'active' as TaskStatus,
		priority: 'high' as TaskPriority,
		startDate: '2026-03-18',
		endDate: '2026-03-21',
		completed: false,
		updatedAt: MOCKED_NOW,
	};

	it('should update task and return it when request succeeds', async () => {
		// ARRANGE
		const dbTask: Omit<DbTask, 'user_id'> = {
			id: taskId,
			column_id: 'c1',
			title: taskData.title,
			description: taskData.description,
			status: taskData.status,
			priority: taskData.priority,
			start_date: taskData.startDate,
			end_date: taskData.endDate,
			completed: taskData.completed,
			position: 0,
			created_at: '18.03.2026, 15:00',
			updated_at: MOCKED_NOW,
		};

		(supabase.from as Mock).mockReturnValue(
			mockChain(['update', 'eq', 'eq', 'select', 'single'], { data: dbTask, error: null })
		);

		// ACT
		const result = await editTaskApi(taskId, taskData);

		// ASSERT
		expect(result).toMatchObject({ ...taskData, id: taskId, position: 0 });
		expect(result.createdAt).toBeDefined();
		expect(result.updatedAt).toEqual(MOCKED_NOW);
	});

	it('should throw error when API returns error', async () => {
		// ARRANGE
		(supabase.from as Mock).mockReturnValue(
			mockChain(['update', 'eq', 'eq', 'select', 'single'], {
				data: null,
				error: new Error(),
			})
		);

		// ACT + ASSERT
		await expect(editTaskApi(taskId, taskData)).rejects.toBeInstanceOf(Error);
	});
});

describe('deleteTaskApi', () => {
	const taskId = 't1';

	it('should delete task when request succeeds', async () => {
		// ARRANGE
		(supabase.from as Mock).mockReturnValue(mockChain(['delete', 'eq', 'eq'], { data: null, error: null }));

		// ACT
		await deleteTaskApi(taskId);

		// ASSERT
		expect(supabase.from).toHaveBeenCalled();
	});

	it('should throw error when API returns error', async () => {
		// ARRANGE
		(supabase.from as Mock).mockReturnValue(mockChain(['delete', 'eq', 'eq'], { data: null, error: new Error() }));

		// ACT + ASSERT
		await expect(deleteTaskApi(taskId)).rejects.toBeInstanceOf(Error);
	});
});

describe('moveTaskApi', () => {
	const taskId = 't1';
	const newColumnId = 'c2';
	const newPosition = 5;

	const taskData: Omit<Task, 'createdAt'> = {
		id: 't1',
		columnId: 'c1',
		title: 'Обычная задача',
		description: 'Описание задачи',
		status: 'waiting',
		priority: 'high',
		startDate: '2026-03-18',
		endDate: '2026-03-20',
		completed: false,
		position: 0,
		updatedAt: MOCKED_NOW,
	};

	it('should move task and return it when request succeeds', async () => {
		// ARRANGE
		const dbTask: Omit<DbTask, 'user_id'> = {
			id: taskId,
			column_id: newColumnId,
			title: taskData.title,
			description: taskData.description,
			status: taskData.status,
			priority: taskData.priority,
			start_date: taskData.startDate,
			end_date: taskData.endDate,
			completed: taskData.completed,
			position: newPosition,
			created_at: '18.03.2026, 10:00',
			updated_at: MOCKED_NOW,
		};

		(supabase.from as Mock).mockReturnValue(
			mockChain(['update', 'eq', 'eq', 'select', 'single'], { data: dbTask, error: null })
		);

		// ACT
		const result = await moveTaskApi(taskId, newColumnId, newPosition, MOCKED_NOW);

		// ASSERT
		expect(result).toMatchObject({ ...taskData, id: taskId, columnId: newColumnId, position: newPosition });
		expect(result.createdAt).toEqual(dbTask.created_at);
		expect(result.updatedAt).toEqual(MOCKED_NOW);
	});

	it('should throw error when API returns error', async () => {
		// ARRANGE
		(supabase.from as Mock).mockReturnValue(
			mockChain(['update', 'eq', 'eq', 'select', 'single'], { data: null, error: new Error() })
		);

		// ACT + ASSERT
		await expect(moveTaskApi(taskId, newColumnId, newPosition, MOCKED_NOW)).rejects.toBeInstanceOf(Error);
	});
});
