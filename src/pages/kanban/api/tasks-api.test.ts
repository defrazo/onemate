import { beforeEach, describe, expect, it, type Mock, vi } from 'vitest';

import { supabase } from '@/shared/lib/supabase';

import type { TaskPriority, TaskStatus } from '../lib';
import type { DbTask, Task } from '../model';
import { getCurrentUser } from './auth-api';
import { addTaskApi, deleteTaskApi, editTaskApi, fetchTasksApi, moveTaskApi } from './tasks-api';

vi.mock('@/shared/lib/supabase', () => ({
	supabase: { from: vi.fn() },
}));

vi.mock('./auth-api', () => ({ getCurrentUser: vi.fn() }));

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
		const dbTasks: Omit<DbTask, 'user_id' | 'created_at'>[] = [
			{
				id: 't1',
				title: 'Обычная задача',
				description: 'Описание задачи',
				column_id: 'c1',
				status: 'waiting',
				priority: 'high',
				position: 0,
				date: '18.03.2026, 10:00',
				start_date: '2026-03-18',
				end_date: '2026-03-20',
			},
		];

		(supabase.from as Mock).mockReturnValue(mockChain(['select', 'eq', 'order'], { data: dbTasks, error: null }));

		// ACT
		const result = await fetchTasksApi();

		// ASSERT
		expect(result).toEqual([
			{
				id: 't1',
				title: 'Обычная задача',
				description: 'Описание задачи',
				columnId: 'c1',
				status: 'waiting',
				priority: 'high',
				position: 0,
				date: '18.03.2026, 10:00',
				startDate: '2026-03-18',
				endDate: '2026-03-20',
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
	const taskData: Omit<Task, 'id'> = {
		title: 'Новая задача',
		description: 'Описание задачи',
		columnId: 'c1',
		status: 'waiting',
		priority: 'medium',
		position: 0,
		date: '18.03.2026, 14:00',
		startDate: '2026-03-18',
		endDate: '2026-03-20',
	};

	it('should add task and return it when request succeeds', async () => {
		// ARRANGE
		const dbTask: Omit<DbTask, 'user_id' | 'created_at'> = {
			id: 't2',
			title: taskData.title,
			description: taskData.description,
			column_id: taskData.columnId,
			status: taskData.status,
			priority: taskData.priority,
			position: taskData.position,
			date: taskData.date,
			start_date: taskData.startDate,
			end_date: taskData.endDate,
		};

		(supabase.from as Mock).mockReturnValue(
			mockChain(['insert', 'select', 'single'], { data: dbTask, error: null })
		);

		// ACT
		const result = await addTaskApi(taskData);

		// ASSERT
		expect(result).toEqual({ ...taskData, id: 't2' });
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
	const taskData: Omit<Task, 'id' | 'position'> = {
		title: 'Обновлено',
		description: 'Новое описание',
		columnId: 'c1',
		status: 'active' as TaskStatus,
		priority: 'high' as TaskPriority,
		date: '18.03.2026, 15:00',
		startDate: '2026-03-18',
		endDate: '2026-03-21',
	};

	it('should update task and return it when request succeeds', async () => {
		// ARRANGE
		const dbTask: Omit<DbTask, 'user_id' | 'created_at'> = {
			id: taskId,
			title: taskData.title,
			description: taskData.description,
			column_id: taskData.columnId,
			status: taskData.status,
			priority: taskData.priority,
			position: 0,
			date: taskData.date,
			start_date: taskData.startDate,
			end_date: taskData.endDate,
		};

		(supabase.from as Mock).mockReturnValue(
			mockChain(['update', 'eq', 'eq', 'select', 'single'], { data: dbTask, error: null })
		);

		// ACT
		const result = await editTaskApi(taskId, taskData);

		// ASSERT
		expect(result).toEqual({ ...taskData, id: taskId, position: 0 });
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

describe('moveTaskApi', () => {
	const taskId = 't1';
	const newColumnId = 'c2';
	const newPosition = 5;

	const taskData: Task = {
		id: 't1',
		title: 'Обычная задача',
		description: 'Описание задачи',
		columnId: 'c1',
		status: 'waiting',
		priority: 'high',
		position: 0,
		date: '18.03.2026, 10:00',
		startDate: '2026-03-18',
		endDate: '2026-03-20',
	};

	it('should move task and return it when request succeeds', async () => {
		// ARRANGE
		const dbTask: Omit<DbTask, 'user_id' | 'created_at'> = {
			id: taskId,
			title: taskData.title,
			description: taskData.description,
			column_id: newColumnId,
			status: taskData.status,
			priority: taskData.priority,
			position: newPosition,
			date: taskData.date,
			start_date: taskData.startDate,
			end_date: taskData.endDate,
		};

		(supabase.from as Mock).mockReturnValue(
			mockChain(['update', 'eq', 'eq', 'select', 'single'], { data: dbTask, error: null })
		);

		// ACT
		const result = await moveTaskApi(taskId, newColumnId, newPosition);

		// ASSERT
		expect(result).toEqual({ ...taskData, id: taskId, columnId: newColumnId, position: newPosition });
	});

	it('should throw error when API returns error', async () => {
		// ARRANGE
		(supabase.from as Mock).mockReturnValue(
			mockChain(['update', 'eq', 'eq', 'select', 'single'], { data: null, error: new Error() })
		);

		// ACT + ASSERT
		await expect(moveTaskApi(taskId, newColumnId, newPosition)).rejects.toBeInstanceOf(Error);
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
