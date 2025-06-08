import { NotifyType } from '../model';

export const leftBorder = (type: NotifyType) => {
	switch (type) {
		case 'success':
			return 'border-l-[var(--status-success-light)]';
		case 'error':
			return 'border-l-[var(--status-error-light)]';
		case 'warning':
			return 'border-l-[var(--status-warning)]';
		case 'info':
			return 'border-l-[var(--status-info)]';
		default:
			return '';
	}
};

export const iconColor = (type: NotifyType) => {
	switch (type) {
		case 'success':
			return 'text-[var(--status-success-light)]';
		case 'error':
			return 'text-[var(--status-error-light)]';
		case 'warning':
			return 'text-[var(--status-warning)]';
		case 'info':
			return 'text-[var(--status-info)]';
		default:
			return '';
	}
};
