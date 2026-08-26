import type { UserStore } from '@/entities/user';
import { BaseRouting } from '@/shared/lib/repository';

import type { INotesRepo, Note } from '../../model';
import { NotesRepoDemo, NotesRepoLaravel } from '.';

export class NotesRepoRouting extends BaseRouting implements INotesRepo {
	private readonly realRepo: INotesRepo;
	private readonly demoRepo: INotesRepo;

	constructor(userStore: UserStore) {
		super(userStore);
		this.realRepo = new NotesRepoLaravel();
		this.demoRepo = new NotesRepoDemo();
	}

	private getTargetRepo(): INotesRepo {
		return this.role === 'demo' ? this.demoRepo : this.realRepo;
	}

	async loadAll(id: string): Promise<Note[]> {
		this.checkPermission('notes', 'read');
		return this.getTargetRepo().loadAll(id);
	}

	async replaceAll(id: string, notes: Note[]): Promise<void> {
		this.checkPermission('notes', 'save');
		return this.getTargetRepo().replaceAll(id, notes);
	}
}
