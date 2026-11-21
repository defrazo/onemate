import type { UserStore } from '@/entities/user';
import { BaseRouting } from '@/shared/lib/repository';

import type { ICredentialsRepo } from '../../model/ports';
import type { CredentialDetails, CredentialInput, CredentialSecret, CredentialsSnapshot } from '../../model/types';
import { CredentialsRepoDemo } from './credentials.repo.demo';
import { CredentialsRepoLaravel } from './credentials.repo.laravel';

export class CredentialsRepoRouting extends BaseRouting implements ICredentialsRepo {
	private readonly realRepo: ICredentialsRepo;
	private readonly demoRepo: CredentialsRepoDemo;

	constructor(userStore: UserStore) {
		super(userStore);
		this.realRepo = new CredentialsRepoLaravel();
		this.demoRepo = new CredentialsRepoDemo();
	}

	reset(): void {
		this.demoRepo.reset();
	}

	private getTargetRepo(): ICredentialsRepo {
		return this.role === 'demo' ? this.demoRepo : this.realRepo;
	}

	async load(signal?: AbortSignal): Promise<CredentialsSnapshot> {
		this.checkPermission('credentials', 'read');
		return this.getTargetRepo().load(signal);
	}

	async initialize(signal?: AbortSignal): Promise<CredentialsSnapshot> {
		this.checkPermission('credentials', 'save');
		return this.getTargetRepo().initialize(signal);
	}

	async show(id: string, signal?: AbortSignal): Promise<CredentialDetails> {
		this.checkPermission('credentials', 'read');
		return this.getTargetRepo().show(id, signal);
	}

	async password(id: string, signal?: AbortSignal): Promise<CredentialSecret> {
		this.checkPermission('credentials', 'read');
		return this.getTargetRepo().password(id, signal);
	}

	async create(input: CredentialInput, revision: number, signal?: AbortSignal): Promise<CredentialsSnapshot> {
		this.checkPermission('credentials', 'save');
		return this.getTargetRepo().create(input, revision, signal);
	}

	async update(
		id: string,
		input: Partial<CredentialInput>,
		revision: number,
		signal?: AbortSignal
	): Promise<CredentialsSnapshot> {
		this.checkPermission('credentials', 'save');
		return this.getTargetRepo().update(id, input, revision, signal);
	}

	async remove(id: string, revision: number, signal?: AbortSignal): Promise<CredentialsSnapshot> {
		this.checkPermission('credentials', 'delete');
		return this.getTargetRepo().remove(id, revision, signal);
	}

	async reorder(ids: string[], revision: number, signal?: AbortSignal): Promise<CredentialsSnapshot> {
		this.checkPermission('credentials', 'save');
		return this.getTargetRepo().reorder(ids, revision, signal);
	}
}
