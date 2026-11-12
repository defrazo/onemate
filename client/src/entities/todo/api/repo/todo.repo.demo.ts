import type { User } from '@/entities/user';
import { generateUUID } from '@/shared/lib/utils';

import { TODO_LIMITS } from '../../model/constants';
import { getDefaultTodoCanvases } from '../../model/defaults';
import type { ITodoRepo } from '../../model/ports';
import type { ItemChanges, ListChanges, TodoCanvas } from '../../model/types';

export class TodoRepoDemo implements ITodoRepo {
	private canvases: TodoCanvas[] = [];
	private currentUserId: string | null = null;

	constructor(private readonly getCurrentUser: () => User | null) {}

	private ensureInitialized(): void {
		const user = this.getCurrentUser();
		if (!user) throw new Error('Нет активного пользователя');

		if (this.currentUserId === user.id) return;

		this.canvases = getDefaultTodoCanvases(user.id);
		this.currentUserId = user.id;
	}

	private prepare(signal: AbortSignal): void {
		signal.throwIfAborted();
		this.ensureInitialized();
	}

	private now(): string {
		return new Date().toISOString();
	}

	private snapshot(): TodoCanvas[] {
		return structuredClone(this.canvases);
	}

	private canvas(id: string): TodoCanvas {
		const canvas = this.canvases.find((entry) => entry.id === id);
		if (!canvas) throw new Error('Холст не найден');
		return canvas;
	}

	private list(id: string) {
		for (const canvas of this.canvases) {
			const list = canvas.lists.find((entry) => entry.id === id);
			if (list) return { canvas, list };
		}

		throw new Error('Список не найден');
	}

	private item(id: string) {
		for (const canvas of this.canvases) {
			for (const list of canvas.lists) {
				const item = list.items.find((entry) => entry.id === id);
				if (item) return { canvas, list, item };
			}
		}

		throw new Error('Пункт не найден');
	}

	private freeSlot(canvas: TodoCanvas): number {
		const used = new Set(canvas.lists.map((list) => list.slot));
		const slot = Array.from({ length: 16 }, (_, idx) => idx).find((value) => !used.has(value));

		if (slot === undefined) throw new Error('Нет свободных слотов');
		return slot;
	}

	private normalize(listId: string): void {
		const { list } = this.list(listId);
		list.items.forEach((item, idx) => {
			item.position = idx;
		});
	}

	async load(signal: AbortSignal): Promise<TodoCanvas[]> {
		this.prepare(signal);
		return this.snapshot();
	}

	async createCanvas(title: string, signal: AbortSignal): Promise<TodoCanvas[]> {
		this.prepare(signal);

		if (this.canvases.length >= TODO_LIMITS.CANVASES) throw new Error('Достигнут лимит холстов');

		const timestamp = this.now();

		this.canvases.push({
			id: generateUUID(),
			user_id: this.currentUserId!,
			title,
			lists: [],
			created_at: timestamp,
			updated_at: timestamp,
		});

		return this.snapshot();
	}

	async renameCanvas(id: string, title: string, signal: AbortSignal): Promise<TodoCanvas[]> {
		this.prepare(signal);

		const canvas = this.canvas(id);
		canvas.title = title;
		canvas.updated_at = this.now();

		return this.snapshot();
	}

	async deleteCanvas(id: string, signal: AbortSignal): Promise<TodoCanvas[]> {
		this.prepare(signal);

		this.canvas(id);

		if (this.canvases.length <= 1) throw new Error('Нельзя удалить последний холст');

		this.canvases = this.canvases.filter((entry) => entry.id !== id);

		return this.snapshot();
	}

	async createList(canvasId: string, title: string, color: string, signal: AbortSignal): Promise<TodoCanvas[]> {
		this.prepare(signal);

		const canvas = this.canvas(canvasId);

		if (canvas.lists.length >= TODO_LIMITS.LISTS) throw new Error('Достигнут лимит списков');

		const timestamp = this.now();
		const slot = this.freeSlot(canvas);

		canvas.lists.push({
			id: generateUUID(),
			canvas_id: canvasId,
			title,
			color,
			slot,
			is_collapsed: false,
			items: [],
			created_at: timestamp,
			updated_at: timestamp,
		});

		canvas.updated_at = timestamp;

		return this.snapshot();
	}

	async updateList(id: string, changes: ListChanges, signal: AbortSignal): Promise<TodoCanvas[]> {
		this.prepare(signal);

		const { canvas, list } = this.list(id);
		const timestamp = this.now();

		Object.assign(list, changes, { updated_at: timestamp });
		canvas.updated_at = timestamp;

		return this.snapshot();
	}

	async deleteList(id: string, signal: AbortSignal): Promise<TodoCanvas[]> {
		this.prepare(signal);

		const { canvas } = this.list(id);
		canvas.lists = canvas.lists.filter((entry) => entry.id !== id);
		canvas.updated_at = this.now();

		return this.snapshot();
	}

	async moveList(id: string, slot: number, signal: AbortSignal): Promise<TodoCanvas[]> {
		this.prepare(signal);

		if (!Number.isInteger(slot) || slot < 0 || slot > 15) throw new Error('Недопустимый слот');

		const { canvas, list } = this.list(id);
		const other = canvas.lists.find((entry) => entry.slot === slot);

		if (list.slot === slot) return this.snapshot();

		const timestamp = this.now();

		if (other) {
			other.slot = list.slot;
			other.updated_at = timestamp;
		}

		list.slot = slot;
		list.updated_at = timestamp;
		canvas.updated_at = timestamp;

		return this.snapshot();
	}

	async createItem(listId: string, text: string, signal: AbortSignal): Promise<TodoCanvas[]> {
		this.prepare(signal);

		const { canvas, list } = this.list(listId);

		if (list.items.length >= TODO_LIMITS.ITEMS) throw new Error('Достигнут лимит пунктов');

		const timestamp = this.now();

		list.items.push({
			id: generateUUID(),
			list_id: listId,
			text,
			position: list.items.length,
			is_completed: false,
			created_at: timestamp,
			updated_at: timestamp,
		});

		list.updated_at = timestamp;
		canvas.updated_at = timestamp;

		return this.snapshot();
	}

	async updateItem(id: string, changes: ItemChanges, signal: AbortSignal): Promise<TodoCanvas[]> {
		this.prepare(signal);

		const { canvas, list, item } = this.item(id);
		const timestamp = this.now();

		Object.assign(item, changes, { updated_at: timestamp });
		list.updated_at = timestamp;
		canvas.updated_at = timestamp;

		return this.snapshot();
	}

	async deleteItem(id: string, signal: AbortSignal): Promise<TodoCanvas[]> {
		this.prepare(signal);

		const { canvas, list } = this.item(id);
		const timestamp = this.now();

		list.items = list.items.filter((entry) => entry.id !== id);
		this.normalize(list.id);

		list.updated_at = timestamp;
		canvas.updated_at = timestamp;

		return this.snapshot();
	}

	async reorderItems(listId: string, itemIds: string[], signal: AbortSignal): Promise<TodoCanvas[]> {
		this.prepare(signal);

		const { canvas, list } = this.list(listId);
		const existing = new Set(list.items.map((item) => item.id));

		if (
			itemIds.length !== list.items.length ||
			new Set(itemIds).size !== itemIds.length ||
			itemIds.some((id) => !existing.has(id))
		) {
			throw new Error('Состав списка изменился');
		}

		const byId = new Map(list.items.map((item) => [item.id, item]));

		list.items = itemIds.map((id) => byId.get(id)!);
		this.normalize(listId);

		const timestamp = this.now();
		list.updated_at = timestamp;
		canvas.updated_at = timestamp;

		return this.snapshot();
	}

	async moveItem(id: string, listId: string, position: number, signal: AbortSignal): Promise<TodoCanvas[]> {
		this.prepare(signal);

		const { canvas: sourceCanvas, list: source, item } = this.item(id);
		const { canvas: targetCanvas, list: target } = this.list(listId);

		const remaining = target.items.filter((entry) => entry.id !== id);

		if (remaining.length >= TODO_LIMITS.ITEMS) throw new Error('Достигнут лимит пунктов');

		if (!Number.isInteger(position) || position < 0 || position > remaining.length)
			throw new Error('Недопустимая позиция');

		const timestamp = this.now();

		if (source.id !== target.id) {
			source.items = source.items.filter((entry) => entry.id !== id);
			item.list_id = target.id;
			source.updated_at = timestamp;
			sourceCanvas.updated_at = timestamp;
		}

		remaining.splice(position, 0, item);
		target.items = remaining;

		this.normalize(target.id);
		if (source.id !== target.id) this.normalize(source.id);

		item.updated_at = timestamp;
		target.updated_at = timestamp;
		targetCanvas.updated_at = timestamp;

		return this.snapshot();
	}
}
