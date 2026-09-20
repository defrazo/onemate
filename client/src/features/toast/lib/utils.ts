import type { NotifyType } from '../model';

export const leftBorder = (type: NotifyType) => {
	switch (type) {
		case 'success':
			return 'border-l-(--status-success)';
		case 'error':
			return 'border-l-(--status-error)';
		case 'warning':
			return 'border-l-(--status-warning)';
		case 'info':
			return 'border-l-(--status-info)';
		default:
			return '';
	}
};

export const iconColor = (type: NotifyType) => {
	switch (type) {
		case 'success':
			return 'text-(--status-success)';
		case 'error':
			return 'text-(--status-error)';
		case 'warning':
			return 'text-(--status-warning)';
		case 'info':
			return 'text-(--status-info)';
		default:
			return '';
	}
};
