import { makeAutoObservable } from 'mobx';

import type { NotifyType } from '@/shared/lib/notify';
import { notify } from '@/shared/lib/notify';

interface Notification {
	message: string;
	type: NotifyType;
}

export class NotifyStore {
	notification: Notification | null = null;

	setNotice(message: string, type: NotifyType) {
		if (this.timeoutId) clearTimeout(this.timeoutId);

		notify[type](message);

		this.notification = { message, type };

		this.timeoutId = setTimeout(() => {
			this.notification = null;
			this.timeoutId = null;
		}, 3000);
	}

	private timeoutId: ReturnType<typeof setTimeout> | null = null;

	constructor() {
		makeAutoObservable(this);
	}
}

export const notifyStore = new NotifyStore();
