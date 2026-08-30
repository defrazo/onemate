import { action, makeObservable, observable } from 'mobx';

import { type Notification, notify, type NotifyType } from '.';

const NOTICE_DURATION = 3000;

export class NotifyStore {
	private timer: ReturnType<typeof setTimeout> | null = null;

	notification: Notification | null = null;

	setNotice(message: string, type: NotifyType): void {
		this.clearTimer();

		notify[type](message);

		this.notification = { message, type };
		this.timer = setTimeout(() => this.clearNotice(), NOTICE_DURATION);
	}

	private clearNotice(): void {
		this.notification = null;
		this.timer = null;
	}

	private clearTimer(): void {
		if (!this.timer) return;

		clearTimeout(this.timer);
		this.timer = null;
	}

	constructor() {
		makeObservable<this, 'clearNotice'>(this, {
			notification: observable,
			setNotice: action,
			clearNotice: action,
		});
	}

	destroy(): void {
		this.clearTimer();
	}
}
