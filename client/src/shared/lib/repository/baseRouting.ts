import { type Feature, type Operation, PermissionService, type Role, type UserStore } from '@/entities/user';

import { PermissionError } from '../errors';

export abstract class BaseRouting {
	constructor(protected readonly userStore: UserStore) {}

	protected get role(): Role {
		return (this.userStore.userRole as Role) ?? 'demo';
	}

	protected checkPermission<F extends Feature>(feature: F, operation: Operation<F>, message?: string) {
		if (!PermissionService.canPerform(this.role, feature, operation)) {
			const defaultMsg = this.role === 'demo' ? 'Недоступно в демо-версии' : 'Недостаточно прав';
			throw new PermissionError(message ?? defaultMsg);
		}
	}

	protected canPerform<F extends Feature>(feature: F, operation: Operation<F>) {
		return PermissionService.canPerform(this.role, feature, operation);
	}
}
