import type { UserStore } from '@/entities/user';
import { BaseRouting } from '@/shared/lib/repository';

import type { INotesRepo } from '../../model/ports';
import type { Note, NotesSnapshot } from '../../model/types';
import { NotesRepoDemo } from './notes.repo.demo';
import { NotesRepoLaravel } from './notes.repo.laravel';

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

	async loadAll(id: string, signal?: AbortSignal): Promise<NotesSnapshot> {
		this.checkPermission('notes', 'read');
		return this.getTargetRepo().loadAll(id, signal);
	}

	async initialize(id: string, signal?: AbortSignal): Promise<NotesSnapshot> {
		this.checkPermission('notes', 'save');

		if (this.userStore.id !== id) throw new Error('Сессия изменилась');

		return this.getTargetRepo().initialize(id, signal);
	}

	async replaceAll(id: string, notes: Note[], revision: number, signal?: AbortSignal): Promise<NotesSnapshot> {
		this.checkPermission('notes', 'save');

		if (this.userStore.id !== id) throw new Error('Сессия изменилась');

		return this.getTargetRepo().replaceAll(id, notes, revision, signal);
	}
}
