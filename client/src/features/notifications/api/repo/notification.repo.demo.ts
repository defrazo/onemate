import { RestrictedAccess } from '@/shared/lib/errors';

import type { INotificationRepo } from '../../model/ports';
import type { AppNotification } from '../../model/types';
import { demoNotifications } from '../demoNotifications';

export class NotificationRepoDemo implements INotificationRepo {
	async getNotifications(): Promise<AppNotification[]> {
		return structuredClone(demoNotifications);
	}

	async readNotification(_id: string): Promise<AppNotification> {
		throw new RestrictedAccess();
	}

	async readAllNotifications(): Promise<void> {
		throw new RestrictedAccess();
	}

	async deleteNotification(_id: string): Promise<void> {
		throw new RestrictedAccess();
	}

	async deleteAllNotifications(): Promise<void> {
		throw new RestrictedAccess();
	}
}
