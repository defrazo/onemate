import type { Feature, Operation, UserStore } from '@/entities/user';
import { PermissionService } from '@/entities/user';
import { PermissionError } from '@/shared/lib/errors';

import type { IUserRepo, Role, User } from '../../model';
import { UserRepoDemo, UserRepoLaravel } from '.';

export class UserRepoRouting implements IUserRepo {
	private readonly realRepo: IUserRepo;
	private readonly demoRepo: IUserRepo;

	constructor(private readonly userStore: UserStore) {
		this.realRepo = new UserRepoLaravel();
		this.demoRepo = new UserRepoDemo(() => this.userStore.user);
	}

	protected get role(): Role {
		return this.userStore.userRole;
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
		return this.realRepo.loadUser();
	}

	async updateUsername(username: string): Promise<User> {
		this.checkPermission('user', 'save');

		return this.getTargetRepo().updateUsername(username);
	}

	async updateEmail(email: string, currentPassword: string): Promise<User> {
		this.checkPermission('user', 'save');

		return this.getTargetRepo().updateEmail(email, currentPassword);
	}

	async updatePassword(currentPassword: string, password: string, passwordConfirmation: string): Promise<User> {
		this.checkPermission('user', 'save');

		return this.getTargetRepo().updatePassword(currentPassword, password, passwordConfirmation);
	}

	async verifyPendingEmail(id: string, hash: string, params: Record<string, string>): Promise<User> {
		return this.realRepo.verifyPendingEmail(id, hash, params);
	}

	async resendPendingEmail(): Promise<void> {
		this.checkPermission('user', 'save');

		return this.getTargetRepo().resendPendingEmail();
	}

	async cancelPendingEmail(): Promise<User> {
		this.checkPermission('user', 'save');

		return this.getTargetRepo().cancelPendingEmail();
	}

	async deleteAccount(): Promise<User> {
		this.checkPermission('user', 'delete', 'Удаление аккаунта недоступно в демо-режиме');

		return this.getTargetRepo().deleteAccount();
	}

	async restoreAccount(): Promise<User> {
		this.checkPermission('user', 'save', 'Восстановление аккаунта недоступно в демо-режиме');

		return this.getTargetRepo().restoreAccount();
	}
}
