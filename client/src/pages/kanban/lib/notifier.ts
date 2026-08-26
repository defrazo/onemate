import errorIcon from '@/shared/assets/icons/system/status/error.svg?raw';
import infoIcon from '@/shared/assets/icons/system/status/info.svg?raw';
import successIcon from '@/shared/assets/icons/system/status/success.svg?raw';
import { cn } from '@/shared/lib/utils';

import { border, layout } from '../ui';
import { deviceUtils, insertSvg } from '.';

type NotifyType = 'success' | 'error' | 'info';
type NotifyConfig = { color: string; icon: string };

const NOTIFY_TYPE = {
	success: { color: '--status-success', icon: successIcon },
	error: { color: '--status-error', icon: errorIcon },
	info: { color: '--status-info', icon: infoIcon },
} satisfies Record<NotifyType, NotifyConfig>;

let currentToast: HTMLElement | null = null;
let currentToastTimeout: number | null = null;
let removeCurrentToast: (() => void) | null = null;

export const notifier = {
	setNotice(text: string, type: NotifyType) {
		removeCurrentToast?.();

		if (currentToastTimeout !== null) {
			clearTimeout(currentToastTimeout);
			currentToastTimeout = null;
		}

		const device = deviceUtils.getDevice();
		const config = NOTIFY_TYPE[type];

		const toast = document.createElement('div');

		const onClick = () => removeToast();

		const removeToast = () => {
			toast.removeEventListener('click', onClick);
			toast.remove();

			if (currentToastTimeout !== null) {
				clearTimeout(currentToastTimeout);
				currentToastTimeout = null;
			}

			if (currentToast === toast) currentToast = null;
			if (removeCurrentToast === removeToast) removeCurrentToast = null;
		};

		toast.className = cn(
			layout.blur,
			border.default,
			`border-l-(${config.color}) absolute z-40 mb-0.5 flex items-center justify-center gap-2 rounded-xl border-l-4 p-3 shadow-lg select-none md:p-2`,
			device === 'desktop' ? 'right-6 bottom-4 min-w-52 2xl:min-w-60' : 'top-4 left-4 w-[calc(100dvw-32px)]'
		);

		toast.addEventListener('click', onClick);
		currentToast = toast;
		removeCurrentToast = removeToast;

		const icon = document.createElement('div');
		insertSvg(icon, config.icon, `size-8 py-1 text-(${config.color})`);

		const message = document.createElement('span');
		message.textContent = text;
		message.className = 'flex-1 pr-2 text-center text-sm';

		toast.append(icon, message);

		const root = document.getElementById('root');
		if (root) root.append(toast);

		currentToastTimeout = window.setTimeout(() => {
			removeToast();
			currentToastTimeout = null;
		}, 3000);
	},
};
