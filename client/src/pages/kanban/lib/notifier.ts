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
			`border-l-(${config.color}) border border-(--border-color) rounded-xl bg-(--bg-tertiary)/50 shadow-(--shadow) backdrop-blur-sm absolute z-40 mb-0.5 flex items-center justify-center gap-2 rounded-xl border-l-4 p-3 shadow-lg select-none md:p-2`,
			device === 'desktop' ? 'right-6 bottom-4 min-w-52 2xl:min-w-60' : 'top-4 left-4 w-[calc(100dvw-32px)]'
		);

		// === ICON ===
		const icon = document.createElement('div');
		insertSvg(icon, config.icon, `size-8 py-1 text-(${config.color})`);

		// === MESSAGE ===
		const message = document.createElement('span');
		message.textContent = text;
		message.className = 'flex-1 pr-2 text-center text-sm';

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
