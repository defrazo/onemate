import type { UserStore } from '@/entities/user';
import { PermissionService } from '@/entities/user';
import { PermissionError } from '@/shared/lib/errors';

import type {
	Column,
	CreateColumnInput,
	CreateTaskInput,
	EditColumnInput,
	EditTaskInput,
	IKanbanRepo,
	Task,
} from '../../model';
import { KanbanRepoDemo, KanbanRepoLaravel } from '.';

export type Role = 'user' | 'demo';

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

	private checkPermission(operation: 'read' | 'save' | 'delete'): void {
		if (!PermissionService.canPerform(this.role, 'kanban', operation)) {
			throw new PermissionError(this.role === 'demo' ? 'Недоступно в демо-версии' : 'Недостаточно прав');
		}
	}

	async fetchColumns(): Promise<Column[]> {
		this.checkPermission('read');
		return this.getTargetRepo().fetchColumns();
	}

	async addColumn(column: CreateColumnInput): Promise<Column> {
		this.checkPermission('save');
		return this.getTargetRepo().addColumn(column);
	}

	async editColumn(id: string, column: EditColumnInput): Promise<Column> {
		this.checkPermission('save');
		return this.getTargetRepo().editColumn(id, column);
	}

	async deleteColumn(id: string): Promise<void> {
		this.checkPermission('delete');
		return this.getTargetRepo().deleteColumn(id);
	}

	async moveColumn(id: string, newPosition: number): Promise<Column> {
		this.checkPermission('save');
		return this.getTargetRepo().moveColumn(id, newPosition);
	}

	async fetchTasks(): Promise<Task[]> {
		this.checkPermission('read');
		return this.getTargetRepo().fetchTasks();
	}

	async addTask(task: CreateTaskInput): Promise<Task> {
		this.checkPermission('save');
		return this.getTargetRepo().addTask(task);
	}

	async editTask(id: string, task: EditTaskInput): Promise<Task> {
		this.checkPermission('save');
		return this.getTargetRepo().editTask(id, task);
	}

	async deleteTask(id: string): Promise<void> {
		this.checkPermission('delete');
		return this.getTargetRepo().deleteTask(id);
	}

	async moveTask(id: string, columnId: string, position: number, updatedAt: string | null): Promise<Task> {
		this.checkPermission('save');
		return this.getTargetRepo().moveTask(id, columnId, position, updatedAt);
	}
}
