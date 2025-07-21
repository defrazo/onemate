import { makeAutoObservable } from 'mobx';

import { notify } from '../lib/notify';

export class NotifyStore {
	success = '';
	error = '';
	warning = '';
	info = '';

	setSuccess(message: string) {
		this.success = message;
		this.showNotification(message, 'success');
	}

	setError(message: string) {
		this.error = message;
		this.showNotification(message, 'error');
	}

	setWarning(message: string) {
		this.warning = message;
		this.showNotification(message, 'warning');
	}

	setInfo(message: string) {
		this.info = message;
		this.showNotification(message, 'info');
	}

	clearMessages() {
		this.success = '';
		this.error = '';
	}

	showNotification(message: string, type: 'success' | 'error' | 'warning' | 'info') {
		switch (type) {
			case 'success':
				notify.success(message);
				break;
			case 'error':
				notify.error(message);
				break;
			case 'warning':
				notify.warning(message);
				break;
			case 'info':
				notify.info(message);
				break;
			default:
				notify.warning(message);
		}

		setTimeout(() => {
			this.clearMessages();
		}, 3000);
	}

	constructor() {
		makeAutoObservable(this);
	}
}

export const notifyStore = new NotifyStore();
