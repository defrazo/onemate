import type { ItemChanges, ListChanges, TodoCanvas } from '.';

export interface ITodoRepo {
	load(signal: AbortSignal): Promise<TodoCanvas[]>;
	createCanvas(title: string, signal: AbortSignal): Promise<TodoCanvas[]>;
	renameCanvas(id: string, title: string, signal: AbortSignal): Promise<TodoCanvas[]>;
	deleteCanvas(id: string, signal: AbortSignal): Promise<TodoCanvas[]>;
	createList(canvasId: string, title: string, color: string, signal: AbortSignal): Promise<TodoCanvas[]>;
	updateList(id: string, changes: ListChanges, signal: AbortSignal): Promise<TodoCanvas[]>;
	deleteList(id: string, signal: AbortSignal): Promise<TodoCanvas[]>;
	moveList(id: string, slot: number, signal: AbortSignal): Promise<TodoCanvas[]>;
	createItem(listId: string, text: string, signal: AbortSignal): Promise<TodoCanvas[]>;
	updateItem(id: string, changes: ItemChanges, signal: AbortSignal): Promise<TodoCanvas[]>;
	deleteItem(id: string, signal: AbortSignal): Promise<TodoCanvas[]>;
	reorderItems(listId: string, itemIds: string[], signal: AbortSignal): Promise<TodoCanvas[]>;
	moveItem(id: string, listId: string, position: number, signal: AbortSignal): Promise<TodoCanvas[]>;
}
