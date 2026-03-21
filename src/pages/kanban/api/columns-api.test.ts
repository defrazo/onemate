import { beforeEach, describe, expect, it, type Mock, vi } from 'vitest';

import { supabase } from '@/shared/lib/supabase';

import type { Column, DbColumn } from '../model';
import { getCurrentUser } from './auth-api';
import { addColumnApi, deleteColumnApi, editColumnApi, fetchColumnsApi, moveColumnApi } from './columns-api';

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

describe('fetchColumnsApi', () => {
	it('should return columns when request succeeds', async () => {
		// ARRANGE
		const dbColumns: Omit<DbColumn, 'user_id'>[] = [
			{ id: 'c1', title: 'Запланировано', position: 0, task_limit: 10, color: 'slate' },
			{ id: 'c2', title: 'Подготовка', position: 1, task_limit: 10, color: 'slate' },
			{ id: 'c3', title: 'В работе', position: 2, task_limit: 10, color: 'slate' },
			{ id: 'c4', title: 'Завершено', position: 3, task_limit: 10, color: 'slate' },
		];

		(supabase.from as Mock).mockReturnValue(mockChain(['select', 'eq', 'order'], { data: dbColumns, error: null }));

		// ACT
		const result = await fetchColumnsApi();

		// ASSERT
		expect(result).toEqual([
			{ id: 'c1', title: 'Запланировано', position: 0, taskLimit: 10, color: 'slate' },
			{ id: 'c2', title: 'Подготовка', position: 1, taskLimit: 10, color: 'slate' },
			{ id: 'c3', title: 'В работе', position: 2, taskLimit: 10, color: 'slate' },
			{ id: 'c4', title: 'Завершено', position: 3, taskLimit: 10, color: 'slate' },
		]);
	});

	it('should throw error when API returns error', async () => {
		// ARRANGE
		(supabase.from as Mock).mockReturnValue(
			mockChain(['select', 'eq', 'order'], { data: null, error: new Error() })
		);

		// ACT + ASSERT
		await expect(fetchColumnsApi()).rejects.toBeInstanceOf(Error);
	});

	it('should return empty array when API returns null', async () => {
		// ARRANGE
		(supabase.from as Mock).mockReturnValue(mockChain(['select', 'eq', 'order'], { data: null, error: null }));

		// ACT
		const result = await fetchColumnsApi();

		// ASSERT
		expect(result).toEqual([]);
	});
});

describe('addColumnApi', () => {
	const columnData: Omit<Column, 'id'> = { title: 'Переделать', position: 4, taskLimit: 10, color: 'slate' };

	it('should add column and return it when request succeeds', async () => {
		// ARRANGE
		const dbColumn: Omit<DbColumn, 'user_id'> = {
			id: 'c5',
			title: columnData.title,
			task_limit: columnData.taskLimit,
			position: columnData.position,
			color: columnData.color,
		};

		(supabase.from as Mock).mockReturnValue(
			mockChain(['insert', 'select', 'single'], { data: dbColumn, error: null })
		);

		// ACT
		const result = await addColumnApi(columnData);

		// ASSERT
		expect(result).toEqual({ ...columnData, id: 'c5' });
	});

	it('should throw error when API returns error', async () => {
		// ARRANGE
		(supabase.from as Mock).mockReturnValue(
			mockChain(['insert', 'select', 'single'], { data: null, error: new Error() })
		);

		// ACT + ASSERT
		await expect(addColumnApi(columnData)).rejects.toBeInstanceOf(Error);
	});
});

describe('editColumnApi', () => {
	const columnId = 'c4';
	const columnData: Omit<Column, 'id' | 'position'> = { title: 'Переделать', taskLimit: 10, color: 'slate' };

	it('should update column and return it when request succeeds', async () => {
		// ARRANGE
		const dbColumn: Omit<DbColumn, 'user_id'> = {
			id: columnId,
			title: columnData.title,
			task_limit: columnData.taskLimit,
			position: 4,
			color: columnData.color,
		};

		(supabase.from as Mock).mockReturnValue(
			mockChain(['update', 'eq', 'eq', 'select', 'single'], { data: dbColumn, error: null })
		);

		// ACT
		const result = await editColumnApi(columnId, columnData);

		// ASSERT
		expect(result).toEqual({ ...columnData, id: columnId, position: 4 });
	});

	it('should throw error when API returns error', async () => {
		// ARRANGE
		(supabase.from as Mock).mockReturnValue(
			mockChain(['update', 'eq', 'eq', 'select', 'single'], { data: null, error: new Error() })
		);

		// ACT + ASSERT
		await expect(editColumnApi(columnId, columnData)).rejects.toBeInstanceOf(Error);
	});
});

describe('moveColumnApi', () => {
	const columnId = 'c4';
	const newPosition = 4;

	it('should move column and return it when request succeeds', async () => {
		// ARRANGE
		const columnData: Column = { id: 'c4', title: 'В работе', position: 2, taskLimit: 10, color: 'slate' };

		const dbColumn: Omit<DbColumn, 'user_id'> = {
			id: columnId,
			title: columnData.title,
			task_limit: columnData.taskLimit,
			position: newPosition,
			color: columnData.color,
		};

		(supabase.from as Mock).mockReturnValue(
			mockChain(['update', 'eq', 'eq', 'select', 'single'], { data: dbColumn, error: null })
		);

		// ACT
		const result = await moveColumnApi(columnId, newPosition);

		// ASSERT
		expect(result).toEqual({ ...columnData, id: 'c4', position: newPosition });
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
		await expect(moveColumnApi(columnId, newPosition)).rejects.toBeInstanceOf(Error);
	});
});

describe('deleteColumnApi', () => {
	const columnId = 'c4';

	it('should delete column when request succeeds', async () => {
		// ARRANGE
		(supabase.from as Mock).mockReturnValue(mockChain(['delete', 'eq', 'eq'], { data: null, error: null }));

		// ACT
		await deleteColumnApi(columnId);

		// ASSERT
		expect(supabase.from).toHaveBeenCalled();
	});

	it('should throw error when API returns error', async () => {
		// ARRANGE
		(supabase.from as Mock).mockReturnValue(mockChain(['delete', 'eq', 'eq'], { data: null, error: new Error() }));

		// ACT + ASSERT
		await expect(deleteColumnApi(columnId)).rejects.toBeInstanceOf(Error);
	});
});
