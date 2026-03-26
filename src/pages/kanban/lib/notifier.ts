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

const device = deviceUtils.getDevice();

export const notifier = {
	setNotice(text: string, type: NotifyType) {
		if (currentToast) currentToast.remove();

		const config = NOTIFY_TYPE[type];

		const toast = document.createElement('div');
		toast.className = cn(
			layout.blur,
			border.default,
			`absolute z-40 flex mb-0.5 items-center justify-center gap-2 rounded-xl border-l-4 p-3 shadow-lg select-none md:p-2 border-l-(${config.color})`,
			device === 'desktop' ? 'right-6 bottom-8 min-w-60' : 'top-4 left-4 w-[calc(100dvw-32px)]'
		);
		toast.addEventListener('click', () => toast.remove());

		currentToast = toast;

		const icon = document.createElement('div');
		insertSvg(icon, config.icon, `size-8 py-1 text-(${config.color})`);

		const message = document.createElement('span');
		message.textContent = text;
		message.className = 'flex-1 pr-2 text-center text-sm';

		toast.append(icon, message);

		const root = document.getElementById('root');
		if (root) root.append(toast);

		setTimeout(() => {
			toast.remove();
			if (currentToast === toast) currentToast = null;
		}, 3000);
	},
};
