import errorIcon from '@/shared/assets/icons/system/status/error.svg?raw';
import successIcon from '@/shared/assets/icons/system/status/success.svg?raw';

import { insertSvg } from '.';

type NotifyType = 'success' | 'error';

export const notifier = {
	setNotice(text: string, type: NotifyType) {
		const toast = document.createElement('div');
		toast.className = `notice ${type === 'success' ? 'border-l-(--status-success)' : 'border-l-(--status-error)'} absolute right-6 bottom-6 flex min-w-60 items-center justify-center gap-2 rounded-xl border border-l-4 border-solid border-(--border-color) bg-[rgba(255,255,255,0.3)] p-3 shadow-lg backdrop-blur-md select-none md:p-2`;

		const icon = document.createElement('div');
		insertSvg(
			icon,
			type === 'success' ? successIcon : errorIcon,
			`size-8 py-1 ${type === 'success' ? 'text-(--status-success)' : 'text-(--status-error)'}`
		);

		const message = document.createElement('span');
		message.textContent = text;
		message.className = 'flex-1 pr-2 text-center text-sm';

		toast.append(icon, message);

		const root = document.getElementById('root');
		if (root) root.appendChild(toast);

		setTimeout(() => toast.remove(), 3000);
	},
};
