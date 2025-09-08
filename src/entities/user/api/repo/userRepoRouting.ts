import type { User } from '@supabase/supabase-js';

import type { Feature, Operation, UserStore } from '@/entities/user';
import { PermissionService } from '@/entities/user';
import { PermissionError } from '@/shared/lib/errors';

import type { IUserRepo, Role } from '../../model';
import { UserRepoDemo, UserRepoSupabase } from '.';

export class UserRepoRouting implements IUserRepo {
	private readonly realRepo: IUserRepo;
	private readonly demoRepo: IUserRepo;

	constructor(private readonly userStore: UserStore) {
		this.realRepo = new UserRepoSupabase();
		this.demoRepo = new UserRepoDemo(() => this.userStore.user);
	}

	protected get role(): Role {
		return (this.userStore.userRole as Role) ?? 'demo';
	}

	protected checkPermission<F extends Feature>(feature: F, operation: Operation<F>, message?: string): void {
		if (!PermissionService.canPerform(this.role, feature, operation)) {
			const defaultMsg = this.role === 'demo' ? 'Недоступно в демо-версии' : 'Недостаточно прав';
			throw new PermissionError(message ?? defaultMsg);
		}
	}

	private getTargetRepo(): IUserRepo {
		return this.role === 'demo' ? this.demoRepo : this.realRepo;
	}

	async loadUser(): Promise<User> {
		this.checkPermission('user', 'read');
		return this.getTargetRepo().loadUser();
	}

	async updateUsername(username: string): Promise<User> {
		this.checkPermission('user', 'save');
		return this.getTargetRepo().updateUsername(username);
	}

	async updateEmail(email: string): Promise<User> {
		this.checkPermission('user', 'save');
		return this.getTargetRepo().updateEmail(email);
	}

	async updatePassword(password: string): Promise<User> {
		this.checkPermission('user', 'save');
		return this.getTargetRepo().updatePassword(password);
	}
}
