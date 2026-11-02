import { api } from '@/shared/api';

import type { ItemChanges, ITodoRepo, ListChanges, TodoCanvas } from '../../model';

export class TodoRepoLaravel implements ITodoRepo {
	async load(signal: AbortSignal): Promise<TodoCanvas[]> {
		const { data } = await api.get<{ canvases: TodoCanvas[] }>('/todo/canvases', { signal });
		return data.canvases;
	}

	async createCanvas(title: string, signal: AbortSignal): Promise<TodoCanvas[]> {
		const { data } = await api.post<{ canvases: TodoCanvas[] }>('/todo/canvases', { title }, { signal });
		return data.canvases;
	}

	async renameCanvas(id: string, title: string, signal: AbortSignal): Promise<TodoCanvas[]> {
		const { data } = await api.patch<{ canvases: TodoCanvas[] }>(`/todo/canvases/${id}`, { title }, { signal });
		return data.canvases;
	}

	async deleteCanvas(id: string, signal: AbortSignal): Promise<TodoCanvas[]> {
		const { data } = await api.delete<{ canvases: TodoCanvas[] }>(`/todo/canvases/${id}`, { signal });
		return data.canvases;
	}

	async createList(canvasId: string, title: string, color: string, signal: AbortSignal): Promise<TodoCanvas[]> {
		const { data } = await api.post<{ canvases: TodoCanvas[] }>(
			`/todo/canvases/${canvasId}/lists`,
			{ title, color },
			{ signal }
		);
		return data.canvases;
	}

	async updateList(id: string, changes: ListChanges, signal: AbortSignal): Promise<TodoCanvas[]> {
		const { data } = await api.patch<{ canvases: TodoCanvas[] }>(`/todo/lists/${id}`, changes, { signal });
		return data.canvases;
	}

	async deleteList(id: string, signal: AbortSignal): Promise<TodoCanvas[]> {
		const { data } = await api.delete<{ canvases: TodoCanvas[] }>(`/todo/lists/${id}`, { signal });
		return data.canvases;
	}

	async moveList(id: string, slot: number, signal: AbortSignal): Promise<TodoCanvas[]> {
		const { data } = await api.patch<{ canvases: TodoCanvas[] }>(`/todo/lists/${id}/slot`, { slot }, { signal });
		return data.canvases;
	}

	async createItem(listId: string, text: string, signal: AbortSignal): Promise<TodoCanvas[]> {
		const { data } = await api.post<{ canvases: TodoCanvas[] }>(
			`/todo/lists/${listId}/items`,
			{ text },
			{ signal }
		);
		return data.canvases;
	}

	async updateItem(id: string, changes: ItemChanges, signal: AbortSignal): Promise<TodoCanvas[]> {
		const { data } = await api.patch<{ canvases: TodoCanvas[] }>(`/todo/items/${id}`, changes, { signal });
		return data.canvases;
	}

	async deleteItem(id: string, signal: AbortSignal): Promise<TodoCanvas[]> {
		const { data } = await api.delete<{ canvases: TodoCanvas[] }>(`/todo/items/${id}`, { signal });
		return data.canvases;
	}

	async reorderItems(listId: string, itemIds: string[], signal: AbortSignal): Promise<TodoCanvas[]> {
		const { data } = await api.patch<{ canvases: TodoCanvas[] }>(
			`/todo/lists/${listId}/items/order`,
			{ item_ids: itemIds },
			{ signal }
		);
		return data.canvases;
	}

	async moveItem(id: string, listId: string, position: number, signal: AbortSignal): Promise<TodoCanvas[]> {
		const { data } = await api.patch<{ canvases: TodoCanvas[] }>(
			`/todo/items/${id}/position`,
			{ list_id: listId, position },
			{ signal }
		);
		return data.canvases;
	}
}
