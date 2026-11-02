import { PermissionService, type UserStore } from '@/entities/user';
import { PermissionError } from '@/shared/lib/errors';

import type { ItemChanges, ITodoRepo, ListChanges, TodoCanvas } from '../../model';
import { TodoRepoDemo, TodoRepoLaravel } from '.';

export class TodoRepoRouting implements ITodoRepo {
	private readonly realRepo: ITodoRepo;
	private readonly demoRepo: ITodoRepo;

	constructor(private readonly userStore: UserStore) {
		this.realRepo = new TodoRepoLaravel();
		this.demoRepo = new TodoRepoDemo(() => this.userStore.user);
	}

	private get role() {
		return this.userStore.userRole;
	}

	private getTargetRepo(): ITodoRepo {
		return this.role === 'demo' ? this.demoRepo : this.realRepo;
	}

	private checkPermission(operation: 'read' | 'save' | 'delete') {
		if (!PermissionService.canPerform(this.role, 'todo', operation)) {
			throw new PermissionError(this.role === 'demo' ? 'Недоступно в демо-режиме' : 'Недостаточно прав');
		}
	}

	load(signal: AbortSignal): Promise<TodoCanvas[]> {
		this.checkPermission('read');
		return this.getTargetRepo().load(signal);
	}

	createCanvas(title: string, signal: AbortSignal): Promise<TodoCanvas[]> {
		this.checkPermission('save');
		return this.getTargetRepo().createCanvas(title, signal);
	}

	renameCanvas(id: string, title: string, signal: AbortSignal): Promise<TodoCanvas[]> {
		this.checkPermission('save');
		return this.getTargetRepo().renameCanvas(id, title, signal);
	}

	deleteCanvas(id: string, signal: AbortSignal): Promise<TodoCanvas[]> {
		this.checkPermission('delete');
		return this.getTargetRepo().deleteCanvas(id, signal);
	}

	createList(canvasId: string, title: string, color: string, signal: AbortSignal): Promise<TodoCanvas[]> {
		this.checkPermission('save');
		return this.getTargetRepo().createList(canvasId, title, color, signal);
	}

	updateList(id: string, changes: ListChanges, signal: AbortSignal): Promise<TodoCanvas[]> {
		this.checkPermission('save');
		return this.getTargetRepo().updateList(id, changes, signal);
	}

	deleteList(id: string, signal: AbortSignal): Promise<TodoCanvas[]> {
		this.checkPermission('delete');
		return this.getTargetRepo().deleteList(id, signal);
	}

	moveList(id: string, slot: number, signal: AbortSignal): Promise<TodoCanvas[]> {
		this.checkPermission('save');
		return this.getTargetRepo().moveList(id, slot, signal);
	}

	createItem(listId: string, text: string, signal: AbortSignal): Promise<TodoCanvas[]> {
		this.checkPermission('save');
		return this.getTargetRepo().createItem(listId, text, signal);
	}

	updateItem(id: string, changes: ItemChanges, signal: AbortSignal): Promise<TodoCanvas[]> {
		this.checkPermission('save');
		return this.getTargetRepo().updateItem(id, changes, signal);
	}

	deleteItem(id: string, signal: AbortSignal): Promise<TodoCanvas[]> {
		this.checkPermission('delete');
		return this.getTargetRepo().deleteItem(id, signal);
	}

	reorderItems(listId: string, itemIds: string[], signal: AbortSignal): Promise<TodoCanvas[]> {
		this.checkPermission('save');
		return this.getTargetRepo().reorderItems(listId, itemIds, signal);
	}

	moveItem(id: string, listId: string, position: number, signal: AbortSignal): Promise<TodoCanvas[]> {
		this.checkPermission('save');
		return this.getTargetRepo().moveItem(id, listId, position, signal);
	}
}
