import { PermissionService, type Role, type UserStore } from '@/entities/user';
import { PermissionError } from '@/shared/lib/errors';

import type { CreateColumnInput, CreateTaskInput, IKanbanRepo } from '../../model';
import { KanbanRepoDemo, KanbanRepoLaravel } from '.';

export class KanbanRepoRouting implements IKanbanRepo {
	private readonly realRepo: IKanbanRepo;
	private readonly demoRepo: IKanbanRepo;

	constructor(private readonly userStore: UserStore) {
		this.realRepo = new KanbanRepoLaravel();
		this.demoRepo = new KanbanRepoDemo();
	}

	private get role(): Role {
		return this.userStore.userRole;
	}

	private getTargetRepo(): IKanbanRepo {
		return this.role === 'demo' ? this.demoRepo : this.realRepo;
	}

	private checkPermission(operation: 'read' | 'save' | 'delete') {
		if (!PermissionService.canPerform(this.role, 'kanban', operation)) {
			throw new PermissionError(this.role === 'demo' ? 'Недоступно в демо-режиме' : 'Недостаточно прав');
		}
	}

	async fetchBoards() {
		this.checkPermission('read');
		return this.getTargetRepo().fetchBoards();
	}

	async initialize() {
		this.checkPermission('read');
		return this.getTargetRepo().initialize();
	}

	async fetchBoard(boardId: string) {
		this.checkPermission('read');
		return this.getTargetRepo().fetchBoard(boardId);
	}

	async createBoard(title: string) {
		this.checkPermission('save');
		return this.getTargetRepo().createBoard(title);
	}

	async renameBoard(boardId: string, revision: number, title: string) {
		this.checkPermission('save');
		return this.getTargetRepo().renameBoard(boardId, revision, title);
	}

	async deleteBoard(boardId: string, revision: number) {
		this.checkPermission('delete');
		return this.getTargetRepo().deleteBoard(boardId, revision);
	}

	async addColumn(boardId: string, revision: number, column: CreateColumnInput) {
		this.checkPermission('save');
		return this.getTargetRepo().addColumn(boardId, revision, column);
	}

	async editColumn(boardId: string, revision: number, id: string, column: Partial<CreateColumnInput>) {
		this.checkPermission('save');
		return this.getTargetRepo().editColumn(boardId, revision, id, column);
	}

	async deleteColumn(boardId: string, revision: number, id: string) {
		this.checkPermission('delete');
		return this.getTargetRepo().deleteColumn(boardId, revision, id);
	}

	async reorderColumns(boardId: string, revision: number, columnIds: string[]) {
		this.checkPermission('save');
		return this.getTargetRepo().reorderColumns(boardId, revision, columnIds);
	}

	async addTask(boardId: string, revision: number, task: CreateTaskInput) {
		this.checkPermission('save');
		return this.getTargetRepo().addTask(boardId, revision, task);
	}

	async editTask(boardId: string, revision: number, id: string, task: Partial<CreateTaskInput>) {
		this.checkPermission('save');
		return this.getTargetRepo().editTask(boardId, revision, id, task);
	}

	async deleteTask(boardId: string, revision: number, id: string) {
		this.checkPermission('delete');
		return this.getTargetRepo().deleteTask(boardId, revision, id);
	}

	async moveTask(boardId: string, revision: number, id: string, columnId: string, position: number) {
		this.checkPermission('save');
		return this.getTargetRepo().moveTask(boardId, revision, id, columnId, position);
	}
}
