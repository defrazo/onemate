import { type Feature, type IUserRoutingPort, type Operation, PermissionService } from '@/entities/user';
import { PermissionError } from '@/shared/lib/errors';

import type { AppNotification, INotificationRepo } from '../../model';
import { NotificationRepoDemo, NotificationRepoLaravel } from '.';

export class NotificationRepoRouting implements INotificationRepo {
	private readonly realRepo: INotificationRepo;
	private readonly demoRepo: INotificationRepo;

	constructor(private readonly userStore: IUserRoutingPort) {
		this.realRepo = new NotificationRepoLaravel();
		this.demoRepo = new NotificationRepoDemo();
	}

	private getTargetRepo(): INotificationRepo {
		return this.userStore.userRole === 'demo' ? this.demoRepo : this.realRepo;
	}

	private checkPermission<F extends Feature>(feature: F, operation: Operation<F>, message?: string): void {
		if (!PermissionService.canPerform(this.userStore.userRole, feature, operation)) {
			const defaultMsg = this.userStore.userRole === 'demo' ? 'Недоступно в демо-режиме' : 'Недостаточно прав';
			throw new PermissionError(message ?? defaultMsg);
		}
	}

	async getNotifications(): Promise<AppNotification[]> {
		this.checkPermission('notification', 'read');
		return this.getTargetRepo().getNotifications();
	}

	async readNotification(id: string): Promise<AppNotification> {
		this.checkPermission('notification', 'save');
		return this.getTargetRepo().readNotification(id);
	}

	async readAllNotifications(): Promise<void> {
		this.checkPermission('notification', 'save');
		return this.getTargetRepo().readAllNotifications();
	}

	async deleteNotification(id: string): Promise<void> {
		this.checkPermission('notification', 'delete');
		return this.getTargetRepo().deleteNotification(id);
	}

	async deleteAllNotifications(): Promise<void> {
		this.checkPermission('notification', 'delete');
		return this.getTargetRepo().deleteAllNotifications();
	}
}
