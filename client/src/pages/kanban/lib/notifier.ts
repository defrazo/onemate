import { cn } from '@/shared/lib/utils';

import { deviceUtils, errorIcon, infoIcon, insertSvg, successIcon } from '../lib';

type NotifyType = 'success' | 'error' | 'info';

const NOTIFY_TYPE = {
	success: { color: '--status-success', icon: successIcon },
	error: { color: '--status-error', icon: errorIcon },
	info: { color: '--status-info', icon: infoIcon },
} satisfies Record<NotifyType, { color: string; icon: string }>;

let removeCurrentToast: (() => void) | null = null;

export const notifier = {
	setNotice(text: string, type: NotifyType) {
		removeCurrentToast?.();

		const device = deviceUtils.getDevice();
		const config = NOTIFY_TYPE[type];

		// === TOAST ===
		const toast = document.createElement('div');
		toast.className = cn(
			'absolute z-40 flex items-center gap-2.5 rounded-xl border border-(--border-color) bg-(--bg-secondary)/95 px-3 py-2.5 shadow-[0_12px_32px_rgba(0,0,0,0.28)] backdrop-blur-xl select-none',
			device === 'desktop' ? 'right-6 bottom-4 min-w-64' : 'top-4 left-4 w-[calc(100dvw-32px)]'
		);

		// === ICON ===
		const icon = document.createElement('div');
		icon.className = `flex size-7 shrink-0 items-center justify-center rounded-lg bg-(${config.color})/10 text-(${config.color})`;

		insertSvg(icon, config.icon, 'size-4');

		// === MESSAGE ===
		const message = document.createElement('span');
		message.textContent = text;
		message.className = 'min-w-0 flex-1 text-sm text-(--color-primary)';

		// === LIFECYCLE ===
		let timeout: number | null = null;
		let isRemoved = false;

		function removeToast() {
			if (isRemoved) return;
			isRemoved = true;

			toast.removeEventListener('click', removeToast);

			if (timeout !== null) {
				clearTimeout(timeout);
				timeout = null;
			}

			toast.remove();

			if (removeCurrentToast === removeToast) removeCurrentToast = null;
		}

		// === ASSEMBLY ===
		toast.append(icon, message);

		const root = document.getElementById('root');
		if (!root) return;

		root.append(toast);

		// === EVENTS ===
		toast.addEventListener('click', removeToast);

		removeCurrentToast = removeToast;
		timeout = window.setTimeout(removeToast, 3000);
	},
};
